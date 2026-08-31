export function calculateCustomFramePrice(
  conf: any,
  pricingConfig: any
): number {
  if (conf.productType === 'frames') {
    const matchingRow = pricingConfig.frames.find(
      (d: any) => d.size === conf.size
    );
    const baseFinal = matchingRow ? matchingRow.finalPrice : 0;

    const [w, h] = (conf.size || '12x8')
      .split('x')
      .map((s: string) => parseFloat(s) || 0);
    const sqFt = (w || 12) * (h || 8) / 144;

    const thickSetting = pricingConfig.settings.thicknesses.find(
      (t: any) => t.thickness === conf.thicknessString
    );
    const thicknessAddon = thickSetting ? thickSetting.addonSqFt * sqFt : 0;

    const finishSetting = pricingConfig.settings.finishes.find(
      (f: any) => f.finish === conf.finish
    );
    const finishSurcharge = finishSetting
      ? baseFinal * finishSetting.surchargePercent
      : 0;

    return Math.round((baseFinal + thicknessAddon + finishSurcharge) / 10) * 10;
  } else if (conf.productType === 'backlit') {
    const matchingRow = pricingConfig.backlit.find(
      (d: any) =>
        d.size === conf.size &&
        d.thickness === conf.thicknessString &&
        d.finish === conf.finish
    );
    return matchingRow ? matchingRow.finalPrice : 0;
  }

  return 0;
}
