import re
import json
from datetime import datetime


def setup_hf(hf_token: str):
    from huggingface_hub import login
    login(hf_token)


def create_conversation(sample):
    system_prompt = """
You are an expert prompt analyst.
Your task is to extract the structural components of the user’s prompt.  
Break the prompt into exactly **7 components**, following the definitions below:

1. role — The role or persona the user wants the model to adopt.  
2. task — The main action or objective the user wants the model to perform.  
3. context — Background information or situational details that help explain *why* or *in what situation* the task is performed.  
4. input — The data, text, code, or content that the user wants the model to operate on directly.  
5. output_requirements — Requirements about the format, style, structure, tone, or constraints on the output.  
6. constraints — Rules or limitations the model must follow.  
7. example — Any example provided by the user that illustrates the expected output.

### IMPORTANT RULES
- If a component is *not explicitly present*, set its value to `"none"`.  
- Do NOT hallucinate. Only extract what is truly there.  
- Follow the JSON schema below exactly. No extra fields.  
- Output must be **valid JSON**, no explanation, no comments.
    """
    user_prompt = f"<user_prompt>{sample['prompt'] }</user_prompt>"
    
    return {
      "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": json.dumps(sample['label'], ensure_ascii=False)}
      ]
    }


def load_data():
    from datasets import Dataset
    def _generator():
        with open('./finetune/data.jsonl', 'r') as jsonl:
            for line in jsonl.readlines():
                try:
                    item = json.loads(line)
                    item['completion'] = json.dumps(item['label'], ensure_ascii=False)
                    yield item
                except Exception:
                    continue

    dataset = Dataset.from_generator(_generator)
    return dataset


def load_train_dataset():
    dataset = load_data()
    return dataset.select(range(2800)) #type:ignore


def load_test_dataset():
    dataset = load_data()
    return dataset.select(range(2800, dataset.num_rows)) #type:ignore


def get_now():
    return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')


def unwrap_markdown(md: str) -> str:
    fenced = re.findall(r'```([^`]*)```', md, flags=re.DOTALL)
    if fenced:
        fenced_with_lang = []
        blocks = []
        lines = md.splitlines(keepends=True)
        i = 0
        n = len(lines)
        while i < n:
            if lines[i].startswith("```"):
                header = lines[i].strip()
                i += 1
                content_lines = []
                while i < n and not lines[i].startswith("```"):
                    content_lines.append(lines[i])
                    i += 1
                if i < n and lines[i].startswith("```"):
                    i += 1
                blocks.append((header, ''.join(content_lines)))
            else:
                i += 1
        for head, content in blocks:
            if re.match(r'``` *sql\b', head, flags=re.IGNORECASE):
                fenced_with_lang.append(content)
        if fenced_with_lang:
            return "\n\n".join(fenced_with_lang).strip()
        # else return all fenced blocks joined
        if blocks:
            return "\n\n".join(c for _, c in blocks).strip()

    inline = re.findall(r'`([^`]+)`', md)
    if inline:
        return " ".join(inline).strip()

    return md.strip()

