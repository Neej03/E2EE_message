import { Request, Response } from 'express';
import { subscriptionsStore, usersStore, logSecurityEvent, SubscriptionRecord } from '../store/inMemoryStore';

export const getSubscription = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  let sub = subscriptionsStore.get(`sub_${userId}`) || Array.from(subscriptionsStore.values()).find(s => s.userId === userId);

  if (!sub) {
    sub = {
      id: `sub_${userId}`,
      userId,
      plan: 'FREE',
      stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString()
    };
    subscriptionsStore.set(sub.id, sub);
  }

  return res.json({
    subscription: sub,
    plans: [
      { id: 'FREE', name: 'Free Tier', price: 0, storageMb: 500, maxGroupMembers: 10, e2eeEnabled: true },
      { id: 'PRO', name: 'Pro Security', price: 12, storageMb: 25000, maxGroupMembers: 100, e2eeEnabled: true, aiAssistant: true },
      { id: 'BUSINESS', name: 'Business Enterprise', price: 49, storageMb: 250000, maxGroupMembers: 500, e2eeEnabled: true, aiAssistant: true, auditLogs: true },
      { id: 'ENTERPRISE', name: 'Enterprise Custom', price: 199, storageMb: 1000000, maxGroupMembers: 5000, e2eeEnabled: true, aiAssistant: true, auditLogs: true, dedicatedRelay: true }
    ]
  });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { plan } = req.body;

    if (!['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = usersStore.get(userId);
    if (user) {
      user.plan = plan as any;
    }

    let sub = subscriptionsStore.get(`sub_${userId}`) || Array.from(subscriptionsStore.values()).find(s => s.userId === userId);
    if (!sub) {
      sub = {
        id: `sub_${userId}`,
        userId,
        plan: plan as any,
        stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString()
      };
    } else {
      sub.plan = plan as any;
    }
    subscriptionsStore.set(sub.id, sub);

    logSecurityEvent(userId, 'SUBSCRIPTION_PLAN_UPGRADED', { plan });

    return res.json({
      success: true,
      message: `Subscription successfully updated to ${plan} Plan`,
      url: `/dashboard/billing?success=true&plan=${plan}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Checkout session failed' });
  }
};
