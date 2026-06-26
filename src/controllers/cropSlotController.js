/**
 * Obtener todos los slots de cultivo del usuario
 */
async function getUserCropSlots(req, res) {
  try {
    const userId = req.user?.id;
    
    const { data, error } = await supabase
      .from('crop_slots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ slots: data || [] });
  } catch (error) {
    console.error('Error fetching crop slots:', error);
    res.status(500).json({ error: 'Error al obtener los slots de cultivo' });
  }
}

async function createCropSlots(req, res) {
  try {
    const userId = req.user?.id;
    const { slots } = req.body; 

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Se requiere un array de slots' });
    }

    const { count: currentCount } = await supabase
      .from('crop_slots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan:membership_plans(slots_total)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const slotsTotal = subscription?.plan?.slots_total || 0;

    if (currentCount + slots.length > slotsTotal) {
      return res.status(400).json({ 
        error: `Límite de slots excedido. Tienes ${slotsTotal} slots disponibles y ya usas ${currentCount}.`
      });
    }

    const slotsToInsert = slots.map(slot => ({
      user_id: userId,
      plant_name: slot.plant_name,
      plant_variety: slot.plant_variety,
      plant_image: slot.plant_image,
      health: slot.health || 'optimal',
      progress: slot.progress || 0,
      days_to_harvest: slot.days_to_harvest || 0,
      rack: slot.rack || '—',
      level: slot.level || 0,
    }));

    const { data, error } = await supabase
      .from('crop_slots')
      .insert(slotsToInsert)
      .select();

    if (error) throw error;

    res.status(201).json({ slots: data });
  } catch (error) {
    console.error('Error creating crop slots:', error);
    res.status(500).json({ error: 'Error al crear los slots de cultivo' });
  }
}

async function updateCropSlots(req, res) {
  try {
    const userId = req.user?.id;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Se requiere un array de slots' });
    }

    const { error: deleteError } = await supabase
      .from('crop_slots')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    if (slots.length > 0) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan:membership_plans(slots_total)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      const slotsTotal = subscription?.plan?.slots_total || 0;

      if (slots.length > slotsTotal) {
        return res.status(400).json({ 
          error: `Límite de slots excedido. Tienes ${slotsTotal} slots disponibles.`
        });
      }

      const slotsToInsert = slots.map(slot => ({
        user_id: userId,
        plant_name: slot.plant_name,
        plant_variety: slot.plant_variety,
        plant_image: slot.plant_image,
        health: slot.health || 'optimal',
        progress: slot.progress || 0,
        days_to_harvest: slot.days_to_harvest || 0,
        rack: slot.rack || '—',
        level: slot.level || 0,
      }));

      const { error: insertError } = await supabase
        .from('crop_slots')
        .insert(slotsToInsert);

      if (insertError) throw insertError;
    }

    res.json({ message: 'Slots actualizados correctamente' });
  } catch (error) {
    console.error('Error updating crop slots:', error);
    res.status(500).json({ error: 'Error al actualizar los slots de cultivo' });
  }
}

async function deleteCropSlot(req, res) {
  try {
    const userId = req.user?.id;
    const { slotId } = req.params;

    const { error } = await supabase
      .from('crop_slots')
      .delete()
      .eq('id', slotId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Slot eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting crop slot:', error);
    res.status(500).json({ error: 'Error al eliminar el slot de cultivo' });
  }
}

module.exports = {
  getUserCropSlots,
  createCropSlots,
  updateCropSlots,
  deleteCropSlot
};
