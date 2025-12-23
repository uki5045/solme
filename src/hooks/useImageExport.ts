'use client';

import { useRef, useCallback } from 'react';
import { domToPng } from 'modern-screenshot';

interface UseImageExportOptions {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  onComplete?: () => void;
}

interface UseImageExportReturn {
  camperResultRef: React.RefObject<HTMLDivElement | null>;
  caravanResultRef: React.RefObject<HTMLDivElement | null>;
  downloadPNG: (type: 'camper' | 'caravan', modelName: string) => Promise<void>;
}

export function useImageExport({ showToast, onComplete }: UseImageExportOptions): UseImageExportReturn {
  const camperResultRef = useRef<HTMLDivElement>(null);
  const caravanResultRef = useRef<HTMLDivElement>(null);

  // 캡처 후 이미지 처리 및 다운로드 (백그라운드)
  const processAndDownload = useCallback((dataUrl: string, modelName: string) => {
    const img = new window.Image();
    img.onload = () => {
      const padding = 40;
      const size = Math.max(img.width, img.height) + padding * 2;

      const squareCanvas = document.createElement('canvas');
      squareCanvas.width = size;
      squareCanvas.height = size;
      const ctx = squareCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        const x = (size - img.width) / 2;
        const y = (size - img.height) / 2;
        ctx.drawImage(img, x, y);

        squareCanvas.toBlob((finalBlob) => {
          if (finalBlob) {
            const url = URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${modelName || '옵션표'}_옵션표.png`;
            link.click();
            URL.revokeObjectURL(url);
            showToast('다운로드 완료', 'success');
          } else {
            showToast('다운로드 실패', 'error');
          }
        }, 'image/png');
      }
    };
    img.onerror = () => showToast('이미지 처리 실패', 'error');
    img.src = dataUrl;
  }, [showToast]);

  // PNG 다운로드 (캡처 후 바로 모달 닫고 백그라운드 처리)
  const downloadPNG = useCallback(async (type: 'camper' | 'caravan', modelName: string) => {
    const container = type === 'camper' ? camperResultRef.current : caravanResultRef.current;
    if (!container) {
      showToast('컨테이너를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      const originalWidth = container.style.width;

      // 1. 높이 측정 및 너비 조정
      const height = container.scrollHeight;
      const targetWidth = Math.max(Math.round(height * 0.95), 800);
      container.style.width = `${targetWidth}px`;

      // 2. 리플로우 대기
      await new Promise(resolve => setTimeout(resolve, 150));

      // 3. 캡처
      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        fetch: { bypassingCache: true },
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      // 4. 원복
      container.style.width = originalWidth;

      // 5. 완료 콜백 (모달 닫기 등)
      onComplete?.();

      // 6. 백그라운드에서 이미지 처리 및 다운로드
      processAndDownload(dataUrl, modelName);
    } catch (e) {
      console.error(e);
      showToast('PNG 생성 실패', 'error');
    }
  }, [showToast, onComplete, processAndDownload]);

  return {
    camperResultRef,
    caravanResultRef,
    downloadPNG,
  };
}
