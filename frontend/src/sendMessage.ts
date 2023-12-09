export const askBot = async (prompt: string) => {
  try {
    return fetch('http://localhost:8080/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({prompt: prompt}),
    }).then(response => {
      return response.json();
    });
  } catch (error) {
    throw error;
  }
};

export const uploadPdf = async (formData: FormData) => {
  try {
    return fetch('http://localhost:8080/api/v1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).then(response => {
      return response.json();
    });
  } catch (error) {
    throw error;
  }
};

export interface OllamaReturnObj {
  model: string;
  created_at: string;
  response: string;
  context?: number[];
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export function convertTextToJson(inputText: string): OllamaReturnObj[] {
  const lines = inputText.trim().split('\n');
  const jsonArray = [];

  for (const line of lines) {
    const jsonObject = JSON.parse(line);
    jsonArray.push(jsonObject);
  }

  return jsonArray;
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
export function trimWhitespace(str: string): string {
  return str.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
}
