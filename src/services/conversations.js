import { supabase } from "../lib/supabase";

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createConversation(
  userId,
  title = "New Chat"
) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title,
      messages: [],
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateConversation(
  conversationId,
  updates
) {
  const { data, error } = await supabase
    .from("conversations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteConversation(
  conversationId
) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    throw error;
  }
}

export async function deleteAllConversations(
  userId
) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}