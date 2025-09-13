import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';
import { ThreadKey, ThreadService } from '../thread/thread.service';
import { MessageItem } from '../message/message.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private currentKey$ = new BehaviorSubject<ThreadKey | null>(null);
  private meId: number = 0;
  private pollingSub?: Subscription;

  private messagesSubject = new BehaviorSubject<MessageItem[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private threadService: ThreadService) {}

  selectThread(key: ThreadKey | null, meId: number): void {
    this.meId = meId;
    this.currentKey$.next(key);
    // Fetch immediately once for instant display
    if (key) {
      this.threadService.getThreadMessages(key).subscribe({
        next: (msgs) => this.messagesSubject.next(msgs || []),
        error: () => {}
      });
    }
    this.start();
  }

  private start(): void {
    // stop any previous
    this.pollingSub?.unsubscribe();

    const key = this.currentKey$.value;
    if (!key) return;

    // Poll every 2s; can be replaced by WebSocket subscribe here
    this.pollingSub = timer(0, 2000)
      .pipe(
        switchMap(() => this.threadService.getThreadMessages(key)),
        // Emit only when content changes by shallow compare of last id + length
        map(list => list || []),
        distinctUntilChanged((a, b) => {
          if (a.length !== b.length) return false;
          const lastA = a[a.length - 1]?.id;
          const lastB = b[b.length - 1]?.id;
          return lastA === lastB;
        })
      )
      .subscribe(messages => this.messagesSubject.next(messages));
  }

  stop(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
    this.currentKey$.next(null);
    this.messagesSubject.next([]);
  }

  send(content: string): Observable<any> {
    const key = this.currentKey$.value;
    if (!key || !this.meId) return of(null);
    return this.threadService.sendToThread(key, this.meId, content);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
