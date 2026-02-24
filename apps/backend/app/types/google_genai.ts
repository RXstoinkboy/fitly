type GoogleGenAIPart = {
  text?: string
  inline_data?: {
    mime_type: string
    data: string
  }
  inlineData?: {
    data?: string
  }
}

type GoogleGenAIContent = {
  parts?: GoogleGenAIPart[]
}

type GoogleGenAICandidate = {
  content?: GoogleGenAIContent
}

export type GoogleGenAIResponse = {
  candidates?: GoogleGenAICandidate[]
}

export type GoogleGenAIInlineImagePart = {
  inline_data: {
    mime_type: string
    data: string
  }
}
