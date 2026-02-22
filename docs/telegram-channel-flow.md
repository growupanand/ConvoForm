# Telegram Channel Flow

## 1. Setup Flow (One-Time)

```mermaid
sequenceDiagram
    actor User
    participant Web as Web UI<br/>(Channels Tab)
    participant tRPC as tRPC Router<br/>(channelConnection.create)
    participant DB as Database<br/>(channelConnections)
    participant CS as Channels Server<br/>(Bun HTTP)
    participant TG as Telegram API

    User->>Web: Enter bot token from @BotFather
    User->>Web: Click "Connect Telegram Bot"
    Web->>tRPC: create({ formId, channelType: "telegram", channelConfig: { botToken } })

    Note over tRPC: Validate form belongs to org
    Note over tRPC: Check no duplicate connection
    Note over tRPC: Encrypt bot token
    Note over tRPC: Generate secretToken
    Note over tRPC: Build webhookUrl from CHANNELS_SERVER_URL

    tRPC->>DB: INSERT channelConnection<br/>{ botToken (encrypted), secretToken, webhookUrl }
    DB-->>tRPC: connection record

    tRPC->>CS: POST /setup/telegram<br/>{ formId, webhookBaseUrl }
    CS->>DB: Lookup channelConnection for form
    DB-->>CS: connection (encrypted botToken)
    Note over CS: Decrypt botToken using ENCRYPTION_KEY
    CS->>TG: POST /bot{token}/setWebhook<br/>{ url: webhookUrl, secret_token }
    TG-->>CS: { ok: true }
    CS-->>tRPC: { ok: true }

    tRPC-->>Web: connection record
    Web-->>User: ✓ "Connected! Webhook registered."
```

## 2. Message Flow (Per Conversation)

```mermaid
sequenceDiagram
    actor TGUser as Telegram User
    participant TG as Telegram API
    participant CS as Channels Server<br/>(Bun HTTP)
    participant Adapter as TelegramAdapter
    participant Handler as ChannelConversation<br/>Handler
    participant SM as SessionManager
    participant AI as CoreService<br/>(AI Engine)
    participant DB as Database

    TGUser->>TG: Sends message to bot
    TG->>CS: POST /webhook/telegram/:formId<br/>{ update_id, message: { text, chat, from } }

    CS->>Adapter: verifyWebhook(request)
    Note over Adapter: Check X-Telegram-Bot-Api-Secret-Token header
    Adapter-->>CS: true

    CS->>Adapter: parseIncoming(body)
    Adapter-->>CS: ChannelMessage { text, senderId, channelType }

    CS->>Handler: handleMessage(message, { formId, operations })

    Handler->>SM: getSession(telegram, senderId, formId)

    alt No existing session (new conversation)
        SM-->>Handler: undefined
        Handler->>DB: createConversation(formId, { channelType, channelSenderId })
        DB-->>Handler: CoreConversation
        Handler->>AI: initialize()
        AI-->>Handler: stream (first question)
        Note over Handler: consumeStream() → collect full text
        Handler->>SM: setSession(telegram, senderId, formId, sessionData)
    else Existing session (continuing conversation)
        SM-->>Handler: SessionData { conversationId, currentFieldId }
        Handler->>DB: getConversation(conversationId)
        DB-->>Handler: CoreConversation
        Handler->>AI: process(answerText, currentFieldId)
        AI-->>Handler: stream (next question or completion)
        Note over Handler: consumeStream() → collect full text

        alt Conversation finished
            Handler->>SM: deleteSession()
        else More questions
            Handler->>SM: setSession() with updated currentFieldId
        end
    end

    Handler-->>CS: responseText
    CS->>Adapter: sendMessage(senderId, { text: responseText })
    Adapter->>TG: POST /bot{token}/sendMessage<br/>{ chat_id, text }
    TG-->>TGUser: Bot replies with question/response
```

## 3. Architecture Overview

```mermaid
graph TB
    subgraph "Web App (Next.js)"
        UI[Channels Tab UI]
        TRPC[tRPC Router<br/>channelConnection]
    end

    subgraph "Channels Server (Bun)"
        WH[Webhook Handler]
        SETUP[Setup Handler]
        SM[SessionManager<br/>In-Memory Map]
    end

    subgraph "Packages"
        CH[ChannelAdapter<br/>Abstract Class]
        TA[TelegramAdapter]
        CCH[ChannelConversation<br/>Handler]
    end

    subgraph "External"
        TGAPI[Telegram Bot API]
        TGUSER[Telegram Users]
    end

    subgraph "Shared"
        DB[(PostgreSQL)]
        CORE[CoreService<br/>AI Engine]
    end

    UI -->|create/update/delete| TRPC
    TRPC -->|auto-setup webhook| SETUP
    TRPC -->|read/write| DB

    TGUSER -->|message| TGAPI
    TGAPI -->|webhook POST| WH
    WH --> TA
    TA --> CCH
    CCH --> SM
    CCH --> CORE
    CCH -->|CRUD| DB
    TA -->|sendMessage| TGAPI
    TGAPI -->|reply| TGUSER

    SETUP -->|setWebhook| TGAPI
    SETUP -->|read config| DB

    CH -.->|extends| TA
