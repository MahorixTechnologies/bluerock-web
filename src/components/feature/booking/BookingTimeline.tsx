"use client";

import { getBookingStatusMeta, getTimelineEvents } from "@/constants/booking-status";
import type { WebBooking } from "@/types/models";

export function BookingTimeline({ booking }: { booking: Pick<WebBooking, "status" | "paymentStatus" | "startDate" | "endDate" | "createdAt"> }) {
  const events = getTimelineEvents(booking);
  const statusMeta = getBookingStatusMeta(booking.status);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)] mb-4">
        Booking Timeline
      </p>
      <div className="relative">
        <div className="space-y-0">
          {events.map((event, i) => {
            const isLast = i === events.length - 1;
            const nextDone = !isLast && events[i + 1].done;
            return (
              <div key={event.key} className="relative flex items-start gap-4">
                {!isLast && (
                  <div
                    className="absolute left-[14px] top-[28px] bottom-[-20px] w-[2px]"
                    style={{ background: event.done && nextDone ? `color-mix(in srgb, ${statusMeta.tint} 40%, transparent)` : "#e5e7eb" }}
                  />
                )}
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                      event.done ? "border-transparent" : "bg-white"
                    }`}
                    style={{
                      background: event.done ? statusMeta.tint : undefined,
                      borderColor: event.done ? undefined : "#d1d5db",
                    }}
                  >
                    {event.done ? (
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p
                      className={`text-sm font-black tracking-tight ${
                        event.done ? "text-[var(--text)]" : "text-[var(--muted-2)]"
                      }`}
                    >
                      {event.label}
                    </p>
                  </div>
                  {event.date ? (
                    <p className="text-xs font-semibold text-[var(--muted)] tabular-nums mt-0.5">
                      {event.date}
                    </p>
                  ) : null}
                  <p
                    className={`mt-0.5 text-xs ${
                      event.done ? "text-[#4b5563]" : "text-[var(--muted-2)]"
                    }`}
                  >
                    {event.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
