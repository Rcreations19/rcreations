import { getPricingConfig } from '@/lib/actions/pricing';
import ConfiguratorClient from './ConfiguratorClient';

export default async function ConfiguratorPage() {
  const config = await getPricingConfig();
  
  return (
    <ConfiguratorClient config={config || { frames: [], backlit: [] }} />
  );
}
