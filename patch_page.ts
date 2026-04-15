import fs from 'fs';

let content = fs.readFileSync('src/app/artifacts/page.tsx', 'utf-8');

content = content.replace(
/output_format: data\.rendered_output\.type === 'html' \? 'html_preview' :\s*data\.rendered_output\.type === 'document' \? 'document_view' :\s*data\.rendered_output\.type === 'code' \? 'code_block' :\s*data\.rendered_output\.type === 'image' \? 'image_card' : 'text_message',\s*content: data\.rendered_output\.html \|\| data\.rendered_output\.markdown \|\| data\.rendered_output\.code \|\| data\.rendered_output\.url \|\| data\.rendered_output\.content,/g,
`output_format: data.rendered_output.output_format,
              content: data.rendered_output.content,`
);

content = content.replace(
/output_format: finalOutputData\.type === 'html' \? 'html_preview' :\s*finalOutputData\.type === 'document' \? 'document_view' :\s*finalOutputData\.type === 'code' \? 'code_block' :\s*finalOutputData\.type === 'image' \? 'image_card' : 'text_message',\s*content: finalOutputData\.html \|\| finalOutputData\.markdown \|\| finalOutputData\.code \|\| finalOutputData\.url \|\| finalOutputData\.content,/g,
`output_format: finalOutputData.output_format,
            content: finalOutputData.content,`
);

fs.writeFileSync('src/app/artifacts/page.tsx', content);
