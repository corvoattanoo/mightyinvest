import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AllocationSlice {
    label: string;
    value: number;
    color: string;
}

interface ArcSegment extends AllocationSlice {
    percentage: number;
    startAngle: number;
    endAngle: number;
    path: string;
    outerPath: string;
    hoverPath: string;
    labelX: number;
    labelY: number;
    midX: number;
    midY: number;
}

@Component({
    selector: 'app-allocation-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './allocation-chart.html',
    styleUrl: './allocation-chart.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationChartComponent implements OnChanges {
    @Input() slices: AllocationSlice[] = [];
    @Input() total: number = 0;

    segments: ArcSegment[] = [];
    activeLabel: string | null = null;

    readonly cx = 200;
    readonly cy = 200;
    readonly outerR = 160;
    readonly innerR = 100;
    readonly hoverOuterR = 172;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['slices'] || changes['total']) {
            this.buildSegments();
        }
    }

    private toRad(deg: number): number {
        return (deg * Math.PI) / 180;
    }

    private arcPath(
        cx: number,
        cy: number,
        outerR: number,
        innerR: number,
        startAngle: number,
        endAngle: number
    ): string {
        const toR = (a: number) => ((a - 90) * Math.PI) / 180;
        const s = toR(startAngle);
        const e = toR(endAngle);
        const gap = 1.5; // gap in degrees for spacing
        const sg = ((gap / 2 / 360) * 2 * Math.PI);
        const ss = s + sg;
        const ee = e - sg;
        const large = endAngle - startAngle > 180 ? 1 : 0;

        const x1 = cx + outerR * Math.cos(ss);
        const y1 = cy + outerR * Math.sin(ss);
        const x2 = cx + outerR * Math.cos(ee);
        const y2 = cy + outerR * Math.sin(ee);
        const x3 = cx + innerR * Math.cos(ee);
        const y3 = cy + innerR * Math.sin(ee);
        const x4 = cx + innerR * Math.cos(ss);
        const y4 = cy + innerR * Math.sin(ss);

        return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
    }

    private buildSegments(): void {
        if (!this.total || !this.slices.length) {
            this.segments = [];
            return;
        }

        let cumAngle = 0;
        this.segments = this.slices
            .filter((s) => s.value > 0)
            .map((slice) => {
                const pct = slice.value / this.total;
                const sweep = pct * 360;
                const start = cumAngle;
                const end = cumAngle + sweep;
                const midAngle = ((start + end) / 2 - 90) * (Math.PI / 180);
                const midR = (this.outerR + this.innerR) / 2;
                cumAngle = end;

                const labelR = this.outerR + 22;
                return {
                    ...slice,
                    percentage: pct * 100,
                    startAngle: start,
                    endAngle: end,
                    path: this.arcPath(this.cx, this.cy, this.outerR, this.innerR, start, end),
                    hoverPath: this.arcPath(this.cx, this.cy, this.hoverOuterR, this.innerR - 6, start, end),
                    outerPath: this.arcPath(this.cx, this.cy, this.outerR + 30, this.outerR + 10, start, end),
                    midX: this.cx + midR * Math.cos(midAngle),
                    midY: this.cy + midR * Math.sin(midAngle),
                    labelX: this.cx + labelR * Math.cos(midAngle),
                    labelY: this.cy + labelR * Math.sin(midAngle),
                };
            });
    }

    toggleActive(label: string): void {
        this.activeLabel = this.activeLabel === label ? null : label;
    }

    isActive(label: string): boolean {
        return this.activeLabel === null || this.activeLabel === label;
    }

    isSelected(label: string): boolean {
        return this.activeLabel === label;
    }

    trackByLabel(_: number, seg: ArcSegment): string {
        return seg.label;
    }
}
