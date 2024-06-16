import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { FireService } from '../services/fire.service';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
})
export class GraficosPage implements OnInit {
  constructor(private firestore: FireService) {}

  async ngOnInit() {
    try {
      const usuarioId = await this.firestore.getUserUid() || "";
      console.log("Usuario ID:", usuarioId);
      const gastos = await this.firestore.obtenerGastosPorCategoria(usuarioId);
      console.log("Gastos obtenidos:", gastos);
      const ahorroData = await this.firestore.obtenerGastosVsAhorroAnualizado(usuarioId);

      this.createPieChart(gastos);
      this.createBarChart(ahorroData);
    } catch (error) {
      console.error(error);
    }
  }
  

  createPieChart(gastos: any[]) {
    const pieChartCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    const ctx = pieChartCanvas?.getContext('2d');

    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }

    const labels = gastos.map((gasto) => gasto.categoria);
    const data = gastos.map((gasto) => gasto.total);

    const pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#a01dcc', '#640485', '#e99cff', 'rgb(132, 67, 153)', 'rgb(24, 10, 28)'],
          },
        ],
      },
    });
  }

  createBarChart(ahorroData: any) {
    const barChartCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    const ctx = barChartCanvas?.getContext('2d');

    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }
    if(ahorroData.ahorroAnualizado < 0)
    {
      ahorroData.ahorroAnualizado = 0;
    }
    const data = {
      labels: ['Gastos', 'Ahorro Anualizado'],
      datasets: [
        {
          label: 'Gastos vs. Ahorro Anualizado',
          data: [ahorroData.gastoAnualizado, ahorroData.ahorroAnualizado],
          backgroundColor: ['#a01dcc', '#FFFFFF'],
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMin: 0,
          suggestedMax: ahorroData.sueldoAnualizado, // Ajusta el máximo en función del sueldo anualizado
        },
      },
    };

    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options,
    });
  }
}
