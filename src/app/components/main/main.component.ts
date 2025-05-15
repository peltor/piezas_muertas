import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.css'
})
export class MainComponent {
  extractedDataQuiter: any[] = [];
  extractedDataVHP: any[] = [];
  protected resultadoComparacion: {
    cantidadVHP: any;
    sumaCantidad: any;
    estado: number;
    cantidadQuiter: any;
    designacion: any;
    referencia: any;
  }[] = [];


  onFileChangeQuiter(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error('Solo se permite un archivo.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      // Obtener la primera hoja
      const wsname: string = workbook.SheetNames[0];
      const ws: XLSX.WorkSheet = workbook.Sheets[wsname];

      // Convertir la hoja en un array de arrays
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(data)

      // Limpiar el encabezado si existe y mapear los datos
      this.extractedDataQuiter = data
        .slice(1,data.length-3) // Ignora la fila de encabezado, si la primera fila contiene encabezados
        .map(row => ({
          referencia: row[0].split('/')[1], // Columna B (índice 1)
          designacion: row[1], // Columna C (índice 2)
          cantidad: row[5], // Columna G (índice 6)
        }))
        .filter(row => row.referencia !== undefined && row.designacion !== undefined && row.cantidad !== undefined); // Filtrar vacíos opcionalmente
    console.log(this.extractedDataQuiter);
    };

    reader.readAsBinaryString(target.files[0]);
  }
  onFileChangeVHP(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error('Solo se permite un archivo.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      // Obtener la primera hoja
      const wsname: string = workbook.SheetNames[0];
      const ws: XLSX.WorkSheet = workbook.Sheets[wsname];

      // Convertir la hoja en un array de arrays
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });


      // Limpiar el encabezado si existe y mapear los datos
      const rawData = data
        .slice(1)
        .map(row => ({
          referencia: row[9],      // columna B
          designacion: row[10],     // columna C
          cantidad: Number(row[8]) || 0  // columna G (convertir a número)
        }))
        .filter(row => row.referencia && row.designacion && !isNaN(row.cantidad));

      // Agrupar por referencia
      const map = new Map<string, { referencia: string, designacion: string, cantidad: number }>();

      for (const item of rawData) {
        if (map.has(item.referencia)) {
          map.get(item.referencia)!.cantidad += item.cantidad;
        } else {
          map.set(item.referencia, { ...item });
        }
      }

      this.extractedDataVHP = Array.from(map.values());
      console.log(this.extractedDataVHP)
    };

    reader.readAsBinaryString(target.files[0]);
  }

  filterData() {
    const resultadoComparacion = this.extractedDataQuiter.map(itemQuiter => {
      const matchVHP = this.extractedDataVHP.find(
        itemVHP => itemVHP.referencia === itemQuiter.referencia
      );

      if (!matchVHP) {
        return {
          referencia: itemQuiter.referencia,
          designacion: itemQuiter.designacion,
          cantidadQuiter: itemQuiter.cantidad,
          cantidadVHP: 0,
          sumaCantidad: itemQuiter.cantidad,
          estado: 0 // No encontrado en VHP
        };
      }

      const suma = itemQuiter.cantidad + matchVHP.cantidad;

      return {
        referencia: itemQuiter.referencia,
        designacion: itemQuiter.designacion,
        cantidadQuiter: itemQuiter.cantidad,
        cantidadVHP: matchVHP.cantidad,
        sumaCantidad: suma,
        estado: suma === 0 ? 1 : 2
      };
    });

    this.resultadoComparacion = resultadoComparacion;
    this.resultadoComparacion.sort((a, b) => {
      // Ordenar por estado (descendente)
      if (b.estado !== a.estado) {
        return b.estado - a.estado;
      }

      // Si estado es igual, ordenar por referencia (ascendente)
      return a.referencia.localeCompare(b.referencia);
    });
    console.log(this.resultadoComparacion)
  }

  downloadExcel() {
    if(this.resultadoComparacion?.length === 0) return console.log('no hay data')

    // Transformar los datos según las reglas
    const transformedData = this.resultadoComparacion.map(({ sumaCantidad, estado, ...rest }) => ({
      ...rest,
      estado: estado === 0 ? '-' : 'VHP'
    }));

    const workbook = XLSX.utils.book_new();

    // Crea una hoja de trabajo a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Añade la hoja al libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Escribe el archivo Excel en formato binario
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Guarda el archivo Excel
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crea un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Negativos_'+Date.now()+'.xlsx'; // Nombre del archivo
    link.click();

    // Limpia el objeto URL después de la descarga
    URL.revokeObjectURL(link.href);

  }

  downloadPDF() {
    if(this.resultadoComparacion?.length === 0) return console.log('no hay data')
    // Crear una nueva instancia de jsPDF
    const doc = new jsPDF();

    // Añadir un título
    doc.text('Datos Exportados', 10, 10);

    // Convertir el array de datos en un formato adecuado para la tabla
    const tableData = this.resultadoComparacion.map((item, index) => [
      index + 1,
      item.referencia,
      item.designacion,
      item.cantidadQuiter,
      item.cantidadVHP,
      item.estado === 0 ? '-' : 'VHP'
    ]);

    // Configurar las columnas de la tabla
    const headers = [
      ['#', 'Referencia', 'Designación', 'Cantidad Quiter', 'Cantidad VHP', 'Estado']
    ];

    // Usar autotable para generar la tabla
    autoTable(doc,{
      head: headers,
      body: tableData,
      startY: 20, // Espacio desde la parte superior
    });

    // Guardar el PDF
    doc.save('datos_'+Date.now()+'.pdf');
  }
}
