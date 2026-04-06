import Anthropic from '@anthropic-ai/sdk'
import { LandingPageData } from '@/lib/schemas/landing'

const systemPrompt = `You are a landing page copywriter for Korean indie makers. Generate compelling landing page copy in Korean based on the user's one-line idea. Use the create_landing_page tool to return structured data.`

const landingPageTool: Anthropic.Tool = {
  name: 'create_landing_page',
  description: 'Create a structured landing page for the given idea',
  input_schema: {
    type: 'object',
    properties: {
      hero: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '메인 헤드라인 (최대 200자)' },
          subtitle: { type: 'string', description: '서브 헤드라인 (최대 500자)' },
        },
        required: ['title', 'subtitle'],
      },
      valueProps: {
        type: 'array',
        description: '정확히 3개의 가치제안',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '가치제안 제목 (최대 100자)' },
            description: { type: 'string', description: '가치제안 설명 (최대 300자)' },
          },
          required: ['title', 'description'],
        },
        minItems: 3,
        maxItems: 3,
      },
      cta: {
        type: 'object',
        properties: {
          buttonText: { type: 'string', description: 'CTA 버튼 텍스트 (최대 50자)' },
          comingSoonMessage: { type: 'string', description: '사전 신청 안내 메시지 (최대 200자)' },
        },
        required: ['buttonText', 'comingSoonMessage'],
      },
      emailForm: {
        type: 'object',
        properties: {
          label: { type: 'string', description: '이메일 입력 라벨 (최대 100자)' },
          placeholder: { type: 'string', description: '이메일 입력 placeholder (최대 100자)' },
          consentText: { type: 'string', description: '개인정보 동의 문구 (최대 300자)' },
        },
        required: ['label', 'placeholder', 'consentText'],
      },
    },
    required: ['hero', 'valueProps', 'cta', 'emailForm'],
  },
}

export async function generateLanding(
  prompt: string,
  instructions?: string
): Promise<LandingPageData> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const userMessage = instructions
    ? `아이디어: ${prompt}\n\n추가 지시사항: ${instructions}`
    : `아이디어: ${prompt}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    tools: [landingPageTool],
    messages: [{ role: 'user', content: userMessage }],
    tool_choice: { type: 'tool', name: 'create_landing_page' },
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('LLM did not use the expected tool')
  }

  return LandingPageData.parse(toolUse.input)
}
