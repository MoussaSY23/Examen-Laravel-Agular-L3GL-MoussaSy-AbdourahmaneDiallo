import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { MessageService, MessageItem } from '../message/message.service';
import { CommandeService } from '../commande/commande.service';

export type ThreadKey = { type: 'commande'; id: number };

@Injectable({ providedIn: 'root' })
export class ThreadService {
  constructor(
    private messageService: MessageService,
    private commandeService: CommandeService
  ) {}

  // Récupérer les messages d'un thread (par commande)
  getThreadMessages(key: ThreadKey): Observable<MessageItem[]> {
    switch (key.type) {
      case 'commande':
        return this.messageService.getConversationByCommande(key.id).pipe(
          map((res: any) => Array.isArray(res) ? res : (res?.data ?? []))
        );
    }
  }

  // Envoyer un message dans un thread commande
  // Résout automatiquement le destinataire à partir de la commande
  sendToThread(key: ThreadKey, meId: number, content: string): Observable<any> {
    switch (key.type) {
      case 'commande':
        return this.commandeService.getCommande(key.id).pipe(
          switchMap((c: any) => {
            const clientId = c?.user_id || c?.client?.id;
            const empId = c?.employe_id || c?.employe?.id;
            let destinataireId: number | undefined;
            if (meId === clientId) destinataireId = empId;
            else if (meId === empId) destinataireId = clientId;
            if (!destinataireId) throw new Error('Impossible de déterminer le destinataire');
            return this.messageService.sendMessage({
              expediteur_id: meId,
              destinataire_id: destinataireId,
              contenu: content,
              commande_id: key.id
            });
          })
        );
    }
  }
}
