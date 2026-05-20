import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartAnalysisService, ChartAnalysis } from '../../core/services/chart-analysis.service';

@Component({
  selector: 'app-ai-analyst',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-analyst.html',
  styleUrl: './ai-analyst.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAnalystComponent implements OnInit {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  analysisResult: ChartAnalysis | null = null;
  history: ChartAnalysis[] = [];
  dragOver: boolean = false;

  constructor(private analysisService: ChartAnalysisService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  // Geçmiş analizleri yükle
  loadHistory(): void {
    this.analysisService.getHistory().subscribe({
      next: (res) => {
        if (res.success) {
          this.ngZone.run(() => {
            this.history = res.data;
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error('Geçmiş analiz yükleme hatası:', err);
      }
    });
  }

  // Bilgisayardan dosya seçildiğinde
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  // Sürükle-bırak (Drag over) olayları
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.handleFile(file);
    } else {
      this.errorMessage = 'Lütfen geçerli bir görsel yükleyin.';
    }
  }

  // Görseli işleme ve önizleme
  handleFile(file: File): void {
    this.selectedFile = file;
    this.errorMessage = '';
    this.analysisResult = null;

    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.imagePreview = reader.result as string;
        this.cdr.markForCheck();
      });    
    };
    reader.readAsDataURL(file);
  }

  // Analiz işlemini başlat
  triggerAnalysis(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.errorMessage = '';
    this.analysisResult = null;
    this.cdr.markForCheck();

    this.analysisService.analyze(this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.analysisResult = res.data;
          this.loadHistory(); // Listeyi yenile
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Analiz sırasında bir hata oluştu.';
        console.error('Analiz hatası:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // Geçmişteki bir analizin detayını gör
  viewPastAnalysis(analysis: ChartAnalysis): void {
    this.analysisResult = analysis;
    this.imagePreview = analysis.image_path;
    this.selectedFile = null;
    this.cdr.markForCheck();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfayı yukarı kaydır
  }

  // Seçimi temizle
  clearSelection(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.analysisResult = null;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }
}
