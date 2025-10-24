import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const socketUrl = apiUrl.replace('/api', '');

        this.socket = io(socketUrl, {
          auth: {
            token
          },
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('🔌 Socket.IO connecté');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket.IO déconnecté:', reason);
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔌 Erreur de connexion Socket.IO:', error);
          this.handleReconnect();
          reject(error);
        });

        // Écouter les événements de notification
        this.setupEventListeners();

      } catch (error) {
        console.error('Erreur lors de la connexion Socket.IO:', error);
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Notifications générales
    this.socket.on('notification', (data) => {
      console.log('📢 Notification reçue:', data);
      this.emit('notification', data);
    });

    // Alertes HSE
    this.socket.on('hse_alert', (data) => {
      console.log('🚨 Alerte HSE reçue:', data);
      this.emit('hse_alert', data);
    });

    // Mises à jour des visites
    this.socket.on('visit_created', (data) => {
      console.log('👥 Visite créée:', data);
      this.emit('visit_created', data);
    });

    this.socket.on('visit_checked_in', (data) => {
      console.log('✅ Visiteur check-in:', data);
      this.emit('visit_checked_in', data);
    });

    this.socket.on('visit_checked_out', (data) => {
      console.log('🚪 Visiteur check-out:', data);
      this.emit('visit_checked_out', data);
    });

    // Mises à jour des colis
    this.socket.on('package_created', (data) => {
      console.log('📦 Colis créé:', data);
      this.emit('package_created', data);
    });

    this.socket.on('package_delivered', (data) => {
      console.log('📬 Colis livré:', data);
      this.emit('package_delivered', data);
    });

    // Mises à jour des équipements
    this.socket.on('equipment_created', (data) => {
      console.log('🔧 Équipement créé:', data);
      this.emit('equipment_created', data);
    });

    this.socket.on('equipment_assigned', (data) => {
      console.log('👤 Équipement assigné:', data);
      this.emit('equipment_assigned', data);
    });

    this.socket.on('equipment_returned', (data) => {
      console.log('↩️ Équipement retourné:', data);
      this.emit('equipment_returned', data);
    });

    // Incidents HSE
    this.socket.on('hse_incident_created', (data) => {
      console.log('⚠️ Incident HSE créé:', data);
      this.emit('hse_incident_created', data);
    });

    this.socket.on('hse_incident_updated', (data) => {
      console.log('📝 Incident HSE mis à jour:', data);
      this.emit('hse_incident_updated', data);
    });

    // Formations HSE
    this.socket.on('hse_training_created', (data) => {
      console.log('🎓 Formation HSE créée:', data);
      this.emit('hse_training_created', data);
    });

    // Posts et communication
    this.socket.on('post_created', (data) => {
      console.log('📝 Post créé:', data);
      this.emit('post_created', data);
    });

    this.socket.on('post_comment_added', (data) => {
      console.log('💬 Commentaire ajouté:', data);
      this.emit('post_comment_added', data);
    });

    this.socket.on('post_liked', (data) => {
      console.log('❤️ Post liké:', data);
      this.emit('post_liked', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectInterval);
    } else {
      console.error('❌ Impossible de se reconnecter à Socket.IO');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket.IO déconnecté');
    }
  }

  // Méthodes pour émettre des événements
  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Méthodes pour écouter des événements
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtenir l'ID de la socket
  getId(): string | undefined {
    return this.socket?.id;
  }
}

// Instance singleton
export const socketService = new SocketService();

// Hook React pour utiliser Socket.IO
export function useSocket() {
  return {
    connect: (token: string) => socketService.connect(token),
    disconnect: () => socketService.disconnect(),
    emit: (event: string, data?: any) => socketService.emit(event, data),
    on: (event: string, callback: (data: any) => void) => socketService.on(event, callback),
    off: (event: string, callback?: (data: any) => void) => socketService.off(event, callback),
    isConnected: () => socketService.isConnected(),
    getId: () => socketService.getId()
  };
}