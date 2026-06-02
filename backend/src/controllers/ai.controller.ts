import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const chat = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("Chưa cấu hình GEMINI_API_KEY, trả về dữ liệu mẫu.");
      return res.json({ 
        success: true, 
        answer: "Chào bạn nhỏ! (Đây là tin nhắn tự động do chưa cấu hình API Key). Hình như bạn đang làm rất tốt, cố gắng lên nhé!"
      });
    }

    const { message, history } = req.body;
    
    // Nếu cả ảnh và text đều không có thì báo lỗi
    if (!req.file && !message) {
      return res.status(400).json({ success: false, message: "Cần gửi câu hỏi hoặc hình ảnh để AI phân tích." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemPrompt = `Bạn là một trợ lý AI thân thiện, hài hước tên là "AI Trợ giảng". Bạn đang giúp học sinh tiểu học và trung học cơ sở học lập trình robot LEGO SPIKE. Hãy trả lời câu hỏi, phân tích lỗi nếu có ảnh. Sử dụng ngôn ngữ vui nhộn, xưng hô "AI Trợ giảng" và "bạn", thân thiện với trẻ em. Không cần giải thích quá dài dòng phức tạp.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] }
    });

    let formattedHistory: any[] = [];
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        let expectedRole = 'user';
        
        for (const msg of parsedHistory) {
          const role = msg.role === 'ai' ? 'model' : 'user';
          const text = msg.content || '';
          
          if (role === expectedRole) {
            formattedHistory.push({ role, parts: [{ text }] });
            expectedRole = role === 'user' ? 'model' : 'user';
          } else {
            // Nếu role không đúng thứ tự xen kẽ (ví dụ: AI chào đầu tiên, hoặc user gửi 2 tin liên tiếp)
            if (formattedHistory.length > 0) {
              formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + text;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }

    const chatSession = model.startChat({
      history: formattedHistory
    });

    let parts: any[] = [];
    
    // Nếu có truyền ảnh
    if (req.file) {
      const mimeType = req.file.mimetype;
      const base64Data = req.file.buffer.toString("base64");
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType
        }
      });
    }

    // Luôn cần có text truyền cho Gemini (nếu không có thì dùng text mặc định)
    parts.push({ text: message ? message : "Hãy phân tích hình ảnh khối lệnh này giúp mình nhé." });

    const result = await chatSession.sendMessage(parts);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, answer: text });

  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi gọi AI: " + error.message });
  }
};
