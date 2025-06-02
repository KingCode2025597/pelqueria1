document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reserva-form');
    const tablaReservas = document.getElementById('tabla-reservas').getElementsByTagName('tbody')[0];
  
    // Cargar las reservas iniciales desde el servidor cuando la página se carga
    fetch('/reservas')
      .then((response) => response.json())
      .then((reservas) => {
        reservas.forEach((reserva) => {
          const row = tablaReservas.insertRow();
          row.setAttribute('data-id', reserva.id); // Agregamos un identificador para la reserva
          row.innerHTML = `
            <td>${reserva.nombre}</td>
            <td>${reserva.telefono}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.hora}</td>
            <td>${reserva.estilo}</td>
            <td><button class="eliminar" data-id="${reserva.id}">Eliminar</button></td>
          `;
  
          // Verificar si la cita ha caducado
          const horaReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
          const horaActual = new Date();
          const diferenciaHoras = (horaActual - horaReserva) / (1000 * 60 * 60); // Diferencia en horas
  
          if (diferenciaHoras >= 3) {
            row.classList.add('caducada'); // Si ha pasado más de 3 horas, ponemos la fila en rojo
          }
        });
  
        // Añadir evento de eliminar
        const botonesEliminar = document.querySelectorAll('.eliminar');
        botonesEliminar.forEach(button => {
          button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            eliminarReserva(id);
          });
        });
      })
      .catch((err) => console.error('Error al cargar reservas', err));
  
    // Manejar el envío del formulario
    form.addEventListener('submit', (event) => {
      event.preventDefault();
  
      // Obtener los datos del formulario
      const formData = new FormData(form);
      const reserva = {
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        estilo: formData.get('estilo'),
      };
  
      // Enviar los datos al servidor usando fetch
      fetch('/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reserva),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Muestra un mensaje de éxito
  
          // Después de guardar, agregar la nueva reserva a la tabla
          const row = tablaReservas.insertRow();
          row.setAttribute('data-id', data.id); // Usamos el ID devuelto por el servidor
          row.innerHTML = `
            <td>${reserva.nombre}</td>
            <td>${reserva.telefono}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.hora}</td>
            <td>${reserva.estilo}</td>
            <td><button class="eliminar" data-id="${data.id}">Eliminar</button></td>
          `;
  
          // Añadir el evento de eliminar
          const nuevoBotonEliminar = row.querySelector('.eliminar');
          nuevoBotonEliminar.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            eliminarReserva(id);
          });
        })
        .catch((err) => {
          console.error('Error al guardar la reserva', err);
        });
  
      // Limpiar el formulario
      form.reset();
    });
  });
  
  // Función para eliminar una reserva
  function eliminarReserva(id) {
    // Llamar a la API para eliminar la reserva
    fetch(`/reservas/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message); // Mostrar mensaje de éxito
        // Eliminar la fila de la tabla
        const row = document.querySelector(`tr[data-id='${id}']`);
        row.remove();
      })
      .catch((err) => console.error('Error al eliminar la reserva', err));
  }
  