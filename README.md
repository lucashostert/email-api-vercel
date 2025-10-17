# 📧 UniCallMed Email API - Vercel

API para envio de códigos de verificação por email usando Resend.

## 🚀 Deploy (1 MINUTO!)

### **1. Instalar Vercel CLI:**
```bash
npm i -g vercel
```

### **2. Login:**
```bash
vercel login
```

### **3. Deploy:**
```bash
cd email-api-vercel
vercel --prod
```

**Pronto! API no ar em ~30 segundos! ✅**

---

## 📡 Endpoint

**URL após deploy:**
```
https://seu-projeto.vercel.app/api/send-verification
```

**Method:** POST

**Body:**
```json
{
  "email": "user@example.com",
  "type": "signup"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123",
  "code": "123456",
  "expiresIn": 600
}
```

---

## 🔧 Como Usar no App

### **Atualizar EmailVerificationService:**

```typescript
// email-verification.service.ts
private API_URL = 'https://seu-projeto.vercel.app/api/send-verification';

async sendVerificationEmail(email: string, type: 'signup' | 'login') {
  try {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Salvar código no Firestore
      await this.saveCodeToFirestore(email, data.code, type);
      
      return { success: true, expiresIn: data.expiresIn };
    }
    
    return { success: false, error: 'Falha ao enviar' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

private async saveCodeToFirestore(email: string, code: string, type: string) {
  const db = getFirestore();
  await setDoc(doc(db, 'verificationCodes', email), {
    code,
    type,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    used: false
  });
}
```

---

## ✅ Vantagens

- ✅ Zero permissões IAM necessárias
- ✅ Deploy instantâneo
- ✅ Grátis (Vercel Free Tier)
- ✅ Edge Functions ultra-rápidas
- ✅ Logs automáticos
- ✅ SSL/HTTPS grátis
- ✅ Custom domains grátis

---

## 🧪 Testar Local

```bash
vercel dev
```

Abre em: `http://localhost:3000`

**Testar:**
```bash
curl -X POST http://localhost:3000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","type":"signup"}'
```

---

## 📊 Ver Logs

```bash
vercel logs
```

Ou no dashboard: https://vercel.com

---

**Deploy completo sem permissões Firebase! 🎉**
