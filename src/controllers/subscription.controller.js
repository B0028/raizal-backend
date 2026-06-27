import { supabaseAdmin } from '../middlewares/auth.middleware.js';

export async function processSubscription(req, res) {
  const { planNameDb, priceUyu } = req.body;
  const userId = req.user.id;

  if (!planNameDb || !priceUyu) {
    return res.status(400).json({ error: 'Parámetros planNameDb y priceUyu son requeridos.' });
  }

  try {
    const { data: existingSubscription, error: existingError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingError) throw existingError;

    const { data: plan, error: planError } = await supabaseAdmin
      .from('membership_plans')
      .select('id, slots_total')
      .eq('plan_name', planNameDb)
      .maybeSingle();

    if (planError) throw planError;
    if (!plan) {
      return res.status(404).json({ error: `El plan "${planNameDb}" no está configurado en el sistema.` });
    }

    if (existingSubscription) {
      const { error: cancelError } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', existingSubscription.id);

      if (cancelError) throw cancelError;
    }

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateString = endDate.toISOString().split('T')[0];

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          slots_used: 0,
          start_date: startDate,
          end_date: endDateString,
          auto_renew: true,
          payment_method: 'simulated_card',
        },
      ])
      .select()
      .single();

    if (subError) throw subError;

    const { error: paymentError } = await supabaseAdmin
      .from('subscription_payments')
      .insert([
        {
          subscription_id: subscription.id,
          payment_amount: priceUyu,
          payment_method: 'simulated_card',
          transaction_id: `SIM-TX-${Math.floor(Math.random() * 1000000)}`,
          payment_status: 'approved',
          payment_date: new Date().toISOString(),
        },
      ]);

    if (paymentError) throw paymentError;

    return res.status(201).json({
      success: true,
      message: `¡Suscripción al plan "${planNameDb}" procesada con éxito!`,
      subscription: {
        id: subscription.id,
        plan: planNameDb,
        slots_total: plan.slots_total,
        start_date: startDate,
        end_date: endDateString,
      },
    });

  } catch (error) {
    console.error('Error procesando la suscripción en backend:', error);
    return res.status(500).json({ error: 'Error del servidor al procesar la suscripción.' });
  }
}