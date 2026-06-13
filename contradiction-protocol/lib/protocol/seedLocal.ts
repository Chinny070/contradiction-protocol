import { generateSalt } from '@/lib/commitments/salts';
import { createAssumptionCommitment } from '@/lib/commitments/hash';
import { normaliseAssumption } from '@/lib/commitments/normalise';
import type { PrivateAssumption } from '@/types';

export function createDemoAssumptions(agreementId: string): PrivateAssumption[] {
  const defs = [
    {
      title: 'Port Access Condition',
      category: 'DELIVERY_CONDITION' as const,
      raw: 'The Lagos port remains open for inbound equipment delivery through July 30.',
      trigger: 'Port closure or suspension of inbound operations',
      expected: 'Port operational for inbound delivery',
      test: 'Official port authority notice or news report confirming closure',
      materiality: 'Any closure exceeding 3 business days',
      remedy: 'PAUSE' as const,
    },
    {
      title: 'Raw Material Price Band',
      category: 'MARKET_PRICE' as const,
      raw: 'Steel price index remains within ±15% of the baseline price agreed at contract signing.',
      trigger: 'Steel price index movement exceeding 15% from baseline',
      expected: 'Price within agreed band',
      test: 'LME or commodity exchange price data showing deviation',
      materiality: 'Movement exceeding 15% for more than 5 consecutive trading days',
      remedy: 'RENEGOTIATE' as const,
    },
    {
      title: 'Import Certification Validity',
      category: 'CERTIFICATION' as const,
      raw: 'The required import certification for equipment delivery remains valid and renewable under current regulations.',
      trigger: 'Certification revocation or regulatory change making renewal impossible',
      expected: 'Certification valid and renewable',
      test: 'Official government notice or regulatory gazette entry',
      materiality: 'Any revocation or non-renewability',
      remedy: 'SETTLE_PARTIAL' as const,
    },
  ];

  return defs.map((d, i) => {
    const salt = generateSalt();
    const normalisedText = normaliseAssumption(d.raw);
    const commitment = createAssumptionCommitment(d.raw, salt);
    return {
      localId: `demo-${agreementId}-${i}`,
      agreementId,
      title: d.title,
      category: d.category,
      normalisedText,
      triggerCondition: d.trigger,
      expectedState: d.expected,
      contradictionTest: d.test,
      materialityThreshold: d.materiality,
      preferredRemedy: d.remedy,
      salt,
      commitment,
    };
  });
}
