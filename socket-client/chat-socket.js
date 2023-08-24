const roomIdInput = document.getElementById('roomId');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

// Define o socket inicialmente como null
let socket = null;

sendBtn.addEventListener('click', () => {
  const userIdInput = document.getElementById('userId'); // Obtém o elemento aqui
  const userId = userIdInput.value;
  const roomId = roomIdInput.value;
  const message = messageInput.value;

  if (!socket && userId) {
    socket = io("http://localhost:3000", {
      query: { userId }
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      // Agora que estamos conectados, podemos enviar a mensagem
      if (socket.connected) {
        socket.emit('chatToServer', { roomId, message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    socket.on('chatToClient', (data) => {
      console.log('Received message from server:', data);
      const { senderId, message } = data;
      chatBox.innerHTML += `<p><strong>${senderId}:</strong> ${message}</p>`;
    });
  } else if (socket && socket.connected) {
    // Se o socket já existe e está conectado, podemos enviar a mensagem
    socket.emit('chatToServer', { roomId, message });
  }
});
