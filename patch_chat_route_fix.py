import re

with open("src/app/api/chat/route.ts", "r") as f:
    content = f.read()

image_block = r"""    // Route Image generation
    if (requestType === 'image_generation') {
      const prompt = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage);

      const imageRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
          'X-Title': 'Orbit of Khemet -- Empire Engine',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const imageData = await imageRes.json();
      let imageUrl = '';
      try {
         // OpenRouter extracts the image url
         imageUrl = imageData.choices[0].message.images[0].image_url.url;
      } catch (e) {
         imageUrl = imageData.choices?.[0]?.message?.content?.match(/https?:\/\/[^\s\)]+/)?.[0] || '';
      }

      if (user && profileCredits >= creditCost) {
        await supabaseAdmin.from('profiles').update({ credits: profileCredits - creditCost }).eq('id', user.id);
      }

      const imageMarkdown = `![Generated Image](${imageUrl})\n\n*Generated with Grok Aurora*`;

      const result = await streamText({
        model: openrouter('anthropic/claude-3-haiku'),
        system: 'Return ONLY the text provided to you in the user message. Do not add, remove, or change anything.',
        messages: [{ role: 'user', content: imageMarkdown }],
        maxTokens: 500,
      });

      return result.toDataStreamResponse();
    }

    // 5. Route Perplexity requests directly to Perplexity API"""

content = content.replace("    // 5. Route Perplexity requests directly to Perplexity API", image_block)

with open("src/app/api/chat/route.ts", "w") as f:
    f.write(content)
