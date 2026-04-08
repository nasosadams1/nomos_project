export async function recordSecurityEvent(
  adminClient: {
    from: (table: string) => {
      insert: (values: Record<string, unknown>[]) => Promise<{ error: { message: string } | null }>;
    };
  },
  payload: {
    eventType: string;
    channel: string;
    status: 'accepted' | 'blocked' | 'error' | 'info';
    actorUserId?: string | null;
    actorEmail?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await adminClient.from('security_events').insert([
    {
      event_type: payload.eventType,
      channel: payload.channel,
      status: payload.status,
      actor_user_id: payload.actorUserId ?? null,
      actor_email: payload.actorEmail ?? null,
      reason: payload.reason ?? null,
      metadata: payload.metadata ?? {},
    },
  ]);

  if (error) {
    console.error('Error recording security event:', error.message);
  }
}
