// Obtener la suscripción activa del usuario

async function getUserSubscription(req, res) {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        started_at,
        expires_at,
        plan:membership_plans (
          id,
          name,
          display_name,
          price_monthly,
          slots_total,
          description,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'No tienes una suscripción activa',
          subscription: null,
          slotsTotal: 0
        });
      }
      throw error;
    }

    res.json({
      subscription: data,
      slotsTotal: data.plan?.slots_total || 0
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Error al obtener la suscripción' });
  }
}

async function getMySubscription(req, res) {
  try {
    const userId = req.user?.id;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        started_at,
        expires_at,
        plan:membership_plans (
          id,
          name,
          display_name,
          price_monthly,
          slots_total,
          description,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      subscription: data,
      slotsTotal: data?.plan?.slots_total || 0
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Error al obtener la suscripción' });
  }
}

module.exports = {
  getUserSubscription,
  getMySubscription
};
