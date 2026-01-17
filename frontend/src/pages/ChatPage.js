import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BsSend } from "react-icons/bs";
import { AiOutlineRobot } from "react-icons/ai";
import { IoPersonOutline, IoLibraryOutline, IoFileTrayFullOutline } from "react-icons/io5";

const ChatPage = () => {
    const { id } = useParams(); // Lấy ID từ URL (Ví dụ: /chat/65a7...)
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(id || null);
    const [knowledgeType, setKnowledgeType] = useState('global'); 
    const scrollRef = useRef();

    //Tải tin nhắn cũ
    useEffect(() => {
        const token = localStorage.getItem('token');
        const loadMessages = async () => {
            if (id) {
                try {
                    // Gọi API lấy tin nhắn của Conversation này
                    const res = await axios.get(`http://localhost:5000/api/chat/messages/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Đảm bảo dữ liệu nhận được là một mảng tin nhắn
                    setMessages(Array.isArray(res.data) ? res.data : []);
                    setConversationId(id);
                } catch (err) {
                    console.error("Lỗi tải nội dung chat:", err);
                    setMessages([]); // Nếu lỗi thì để mảng rỗng, không để null/undefined
                }
            } else {
                setMessages([]);
                setConversationId(null);
            }
        };
        loadMessages();
    }, [id]); // Chạy lại mỗi khi ID trên URL thay đổi

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const token = localStorage.getItem('token');
        let currentId = conversationId; 

        const userMsg = { sender: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            if (!currentId) {
                const resNew = await axios.post('http://localhost:5000/api/chat/new', 
                    { title: currentInput.substring(0, 30) + "..." },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                currentId = resNew.data._id;
                setConversationId(currentId);
                window.history.replaceState(null, "", `/chat/${currentId}`);
            }

            const res = await axios.post('http://localhost:5000/api/chat/message', 
                { conversationId: currentId, content: currentInput, knowledgeType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (res.data.aiMsg) setMessages(prev => [...prev, res.data.aiMsg]);
        } catch (err) { console.error("Lỗi gửi tin nhắn:", err); } 
        finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-20px)] bg-[#f9fafb]">
            <div className="bg-white border-b p-3 flex justify-center gap-4 shadow-sm">
                <button onClick={() => setKnowledgeType('global')} className={`px-6 py-2 rounded-full text-sm font-bold ${knowledgeType === 'global' ? 'bg-[#2563eb] text-white shadow-md' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><IoLibraryOutline className="inline mr-2" /> Tri thức chung</button>
                <button onClick={() => setKnowledgeType('private')} className={`px-6 py-2 rounded-full text-sm font-bold ${knowledgeType === 'private' ? 'bg-[#10b981] text-white shadow-md' : 'bg-[#f3f4f6] text-[#6b7280]'}`}><IoFileTrayFullOutline className="inline mr-2" /> Hồ sơ riêng</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${msg.sender === 'user' ? 'bg-[#2563eb]' : 'bg-[#10b981]'}`}>
                                    {msg.sender === 'user' ? <IoPersonOutline size={18}/> : <AiOutlineRobot size={20}/>}
                                </div>
                                <div className={`p-4 rounded-2xl text-[15px] shadow-sm ${msg.sender === 'user' ? 'bg-[#2563eb] text-white rounded-tr-none' : 'bg-white text-[#1f2937] border rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <div className="text-center text-gray-300 mt-20 italic">Không có nội dung tin nhắn cũ.</div>
                )}
                
                {loading && <div className="text-sm text-gray-400 italic text-center">AI đang trả lời...</div>}
                <div ref={scrollRef} />
            </div>

            <div className="p-6 bg-white border-t">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập câu hỏi..." className="flex-1 p-4 bg-[#f3f4f6] rounded-2xl outline-none focus:border-[#2563eb] focus:bg-white border border-transparent transition-all" />
                    <button type="submit" disabled={loading || !input.trim()} className={`p-4 rounded-2xl text-white ${loading || !input.trim() ? 'bg-gray-300' : 'bg-[#2563eb]'}`}><BsSend size={20} /></button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;