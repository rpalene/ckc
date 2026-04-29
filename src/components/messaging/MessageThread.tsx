import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Conversation, Message, Profile } from '../../types'
import Avatar from '../ui/Avatar'
import { formatTime } from '../../lib/utils'

interface Props {
  conversation: Conversation
  currentProfile: Profile
}

export default function MessageThread({ conversation, currentProfile }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const other = currentProfile.role === 'client'
    ? conversation.artisan?.profile
    : conversation.client

  // Load messages
  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) ?? []))

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentProfile.id,
      content: text.trim(),
    })
    setText('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
        <Avatar src={other?.avatar_url} name={other?.full_name || '?'} size="sm" />
        <span className="font-semibold text-marine">{other?.full_name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-200">
        {messages.map(msg => {
          const isMe = msg.sender_id === currentProfile.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
                <div className={`
                  px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isMe
                    ? 'bg-orange text-white rounded-tr-sm'
                    : 'bg-white text-marine rounded-tl-sm shadow-sm'}
                `}>
                  {msg.content}
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 input-field"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-orange text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
