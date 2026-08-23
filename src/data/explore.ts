import type { ExploreTopic } from '@/types/portfolio';

export const exploreTopics: readonly ExploreTopic[] = [
  {
    id: 'mobile',
    title: 'Mobile applications',
    why: 'I know the web deeply. I want the same fluency on a device — React Native first, then enough native to know when the abstraction leaks.',
    status: 'building',
  },
  {
    id: 'rag',
    title: 'Retrieval augmented generation',
    why: 'Chunking, embeddings and ranking are where most RAG systems quietly fail. I want to build one properly instead of gluing a vector store to a prompt.',
    status: 'building',
  },
  {
    id: 'harness',
    title: 'Evaluation harnesses',
    why: 'Test automation instincts applied to models. If I cannot measure a change in output quality, I have not really changed anything.',
    status: 'reading',
  },
  {
    id: 'local-ai',
    title: 'Local and private AI',
    why: 'Ollama on my own hardware, small models fine-tuned for narrow jobs, no data leaving the machine. Useful and genuinely fun.',
    status: 'building',
  },
  {
    id: 'ai-general',
    title: 'AI, past the API call',
    why: 'Enough of the underlying mechanics — tokenisation, context, tool use — to reason about limits rather than guess at them.',
    status: 'reading',
  },
  {
    id: 'robotics',
    title: 'Robotics',
    why: 'Software that moves something physical has a feedback loop nothing else does. Starting with microcontrollers and sensors.',
    status: 'next',
  },
];
