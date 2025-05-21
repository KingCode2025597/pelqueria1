
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('reserva-form');
      const tablaReservas = document.getElementById('tabla-reservas').querySelector('tbody');
    
      function cargarReservas() {
        fetch('/reservas')
          .then(res => res.json())
          .then(reservas => {
            tablaReservas.innerHTML = '';
            reservas.forEach(reserva => {
              const row = document.createElement('tr');
              const fechaHoraReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
              const ahora = new Date();
              const diferenciaHoras = (ahora - fechaHoraReserva) / (1000 * 60 * 60);
    
              // Marcar rojo si han pasado más de 3 horas
              if (diferenciaHoras > 3) {
                row.style.backgroundColor = '#f8d7da'; // rojo suave
              }
    
              row.innerHTML = `
                <td>${reserva.nombre}</td>
                <td>${reserva.telefono}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.estilo}</td>
                <td><button class="eliminar" data-id="${reserva.id}">Eliminar</button></td>
              `;
              tablaReservas.appendChild(row);
    
              // Botón eliminar
              row.querySelector('.eliminar').addEventListener('click', () => {
                eliminarReserva(reserva.id);
              });
            });
          });
      }
    
      function eliminarReserva(id) {
        fetch(`/reservas/${id}`, {
          method: 'DELETE',
        })
        .then(res => res.json())
        .then(() => cargarReservas());
      }
    
      form.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const formData = new FormData(form);
        const reserva = {
          nombre: formData.get('nombre'),
          telefono: formData.get('telefono'),
          fecha: formData.get('fecha'),
          hora: formData.get('hora'),
          estilo: formData.get('estilo')
        };
    
        fetch('/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reserva)
        })
        .then(res => res.json())
        .then(() => {
          form.reset();
          cargarReservas();
        });
      });
    
      cargarReservas();
    });
    