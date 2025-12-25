import { z } from 'zod';

export const SeveritySchema = z.enum(['critical', 'recommended', 'minor']);

export const ProposalSchema = z.object({
  id: z.string(),
  severity: SeveritySchema,
  title: z.string(),
  repo: z.string(),
  type: z.enum([
    'breaking_change',
    'version_drift',
    'naming_inconsistency',
    'missing_mapping',
    'documentation_drift',
    'security',
    'deprecation',
    'typo',
  ]),
  problem: z.string(),
  fix: z.string(),
  files: z.array(z.object({
    path: z.string(),
    change: z.string(),
  })),
  impact: z.string().optional(),
  detectedBy: z.string(),
  detectedAt: z.string().datetime(),
});

export const ProposalDocumentSchema = z.object({
  generatedAt: z.string().datetime(),
  generatedBy: z.literal('lead-architect'),
  summary: z.object({
    critical: z.number(),
    recommended: z.number(),
    minor: z.number(),
  }),
  proposals: z.array(ProposalSchema),
  approvals: z.record(z.string(), z.object({
    status: z.enum(['approved', 'rejected', 'pending', 'needs_discussion']),
    prLink: z.string().optional(),
    notes: z.string().optional(),
    reviewedAt: z.string().datetime().optional(),
  })).optional(),
});

export type Severity = z.infer<typeof SeveritySchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type ProposalDocument = z.infer<typeof ProposalDocumentSchema>;
