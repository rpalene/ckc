import type { Conversation, Profile } from '../../types'
import Avatar from '../ui/Avatar'
import { formatDate } from '../../lib/utils'

interface Props {
  conversations: Conversation[]
  activeId?: string
  currentProfile: Profile
  onSelect: (conv: Conversation) => void
}

export default function ConversationList({ conversations, activeId, currentProfile, onSelect }: Props) {
  const getOther = (conv: Conversation) => {
    if (currentProfile.role === 'client') return conv.artisan?.profile
    return conv.client
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-marine">Messages</h2>
      </div>
      {conversations.length === 0 && (
        <p className="text-center text-gray-400 text-sm p-8">Aucune conversation</p>
      )}
      {conversations.map(conv => {
        const other = getOther(conv)
        const name  = other?.full_name || '—'
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 p-4 text-left hover:bg-cream transition-colors border-b border-gray-50
              ${activeId === conv.id ? 'bg-orange-50 border-l-4 border-l-orange' : ''}`}
          >
            <Avatar src={other?.avatar_url} name={name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-marine text-sm truncate">{name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(conv.created_at)}</span>
              </div>
              {currentProfile.role === 'client' && (
                <p className="text-xs text-gray-400 truncate">
                  {conv.artisan?.business_name}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
