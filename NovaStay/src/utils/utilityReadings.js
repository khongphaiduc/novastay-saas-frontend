export function getPeriodReading(meter, period) {
    return meter.readings?.find(reading => reading.billingPeriod === period)
        ?? (meter.latestReading?.billingPeriod === period ? meter.latestReading : null);
}

export function getPreviousReading(meter, period) {
    const current = getPeriodReading(meter, period);
    if (current) return Number(current.previousReading);
    const readings = meter.readings ?? (meter.latestReading ? [meter.latestReading] : []);
    const previous = readings.filter(reading => reading.billingPeriod < period)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))[0];
    return Number(previous?.currentReading ?? meter.initialReading);
}

export function isRoomRecorded(meters, period) {
    return meters.length > 0 && meters.every(meter => getPeriodReading(meter, period));
}

export function validateReadings(meters, values, period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return 'Vui lòng chọn kỳ ghi nhận hợp lệ.';
    if (meters.length === 0) return 'Vui lòng tạo đồng hồ dịch vụ trước khi ghi số.';
    for (const meter of meters) {
        if (getPeriodReading(meter, period)) continue;
        const raw = values[meter.id];
        const value = Number(raw);
        if (raw == null || String(raw).trim() === '' || !Number.isFinite(value)) {
            return `Vui lòng nhập chỉ số mới cho đồng hồ: ${meter.serviceName}`;
        }
        if (value < 0 || value < getPreviousReading(meter, period)) {
            return `Chỉ số mới của ${meter.serviceName} không được nhỏ hơn số cũ.`;
        }
        if (meter.latestReading?.billingPeriod > period) {
            return `Đồng hồ ${meter.serviceName} đã có số liệu ở kỳ sau. Vui lòng kiểm tra kỳ ghi nhận.`;
        }
    }
    return '';
}

export async function loadAllPages(fetchPage) {
    const items = [];
    for (let page = 1; ; page++) {
        const response = await fetchPage(page);
        items.push(...response.items);
        if (!response.hasNextPage || response.items.length === 0) return items;
    }
}
