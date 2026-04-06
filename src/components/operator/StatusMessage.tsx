interface StatusMessageProps {
  publishedAt: Date | null
  pv: number
  now: number
}

export default function StatusMessage({ publishedAt, pv, now }: StatusMessageProps) {
  if (!publishedAt) return null

  const hoursElapsed = (now - publishedAt.getTime()) / (1000 * 60 * 60)

  if (hoursElapsed < 24) {
    return (
      <p className="text-xs text-blue-600 mt-1">
        📊 발행 {Math.floor(hoursElapsed)}시간 경과. 광고 본격 도달까지는 보통 48~72시간 걸려요.
      </p>
    )
  }
  if (hoursElapsed < 72) {
    return (
      <p className="text-xs text-blue-600 mt-1">
        📊 발행 {Math.floor(hoursElapsed)}시간 경과. 광고가 점차 도달 중입니다.
      </p>
    )
  }
  if (pv < 100) {
    return (
      <p className="text-xs text-amber-600 mt-1">
        📊 72시간 경과했지만 PV가 적어요. 광고 카피나 타겟팅을 점검해보세요.
      </p>
    )
  }
  return null
}
