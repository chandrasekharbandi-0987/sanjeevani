import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { EmptyState, timeAgo } from '@/components/shared';

export default function RecipientChat() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { conversations, messages, sendMessage } = useData();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');

  if (!user) return null;

  const myConvs = conversations.filter(c => c.participantIds.includes(user.id));

  if (selectedConvId) {
    const conv = conversations.find(c => c.id === selectedConvId);
    const otherParticipantId = conv?.participantIds.find(id => id !== user.id) || '';
    const otherName = conv?.participantNames.find((_, i) => conv.participantIds[i] !== user.id) || '';
    const convMessages = messages.filter(m => m.conversationId === selectedConvId);

    async function doSend() {
      if (!msgText.trim()) return;
      await sendMessage(selectedConvId!, otherParticipantId, otherName, msgText.trim());
      setMsgText('');
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6A0000', '#C62828']}
          style={[styles.chatHeader, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 12 }]}
        >
          <Pressable onPress={() => setSelectedConvId(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>{otherName[0]}</Text>
          </View>
          <Text style={styles.chatHeaderName}>{otherName}</Text>
        </LinearGradient>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
          <FlatList
            data={convMessages}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={{ padding: 16, flexDirection: 'column-reverse' }}
            renderItem={({ item }) => {
              const isMine = item.senderId === user.id;
              return (
                <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.text}</Text>
                    <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
                      {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', padding: 32 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#9BA3AF' }}>Start a conversation</Text>
              </View>
            }
          />
          <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              style={styles.msgInput}
              value={msgText}
              onChangeText={setMsgText}
              placeholder="Type a message..."
              placeholderTextColor="#9BA3AF"
              multiline
            />
            <Pressable style={[styles.sendBtn, !msgText.trim() && { opacity: 0.5 }]} onPress={doSend} disabled={!msgText.trim()}>
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6A0000', '#C62828']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSub}>Chat with donors</Text>
      </LinearGradient>

      <FlatList
        data={myConvs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState icon="chat-outline" title="No conversations" subtitle="Find a donor and send a request to start chatting" />
        }
        renderItem={({ item }) => {
          const otherName = item.participantNames.find((_, i) => item.participantIds[i] !== user.id) || '';
          return (
            <Pressable style={styles.convCard} onPress={() => setSelectedConvId(item.id)}>
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{otherName[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.convName}>{otherName}</Text>
                <Text style={styles.convLastMsg} numberOfLines={1}>{item.lastMessage || 'Tap to start chatting'}</Text>
              </View>
              {item.lastMessageTime && <Text style={styles.convTime}>{timeAgo(item.lastMessageTime)}</Text>}
              <Ionicons name="chevron-forward" size={18} color="#9BA3AF" />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  chatAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  chatAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
  chatHeaderName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
  convCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  convAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#2EC4B6', alignItems: 'center', justifyContent: 'center',
  },
  convAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#fff' },
  convName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1E1E1E' },
  convLastMsg: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9BA3AF', marginTop: 2 },
  convTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF' },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%', padding: 12, borderRadius: 16, borderTopLeftRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  bubbleMine: { backgroundColor: '#2EC4B6', borderTopLeftRadius: 16, borderTopRightRadius: 4 },
  bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1E1E1E', lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9BA3AF', marginTop: 4, textAlign: 'right' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, paddingTop: 8, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F4F8',
  },
  msgInput: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1E1E1E',
    backgroundColor: '#F7F9FB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    maxHeight: 100, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2EC4B6', alignItems: 'center', justifyContent: 'center',
  },
});
