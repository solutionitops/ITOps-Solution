import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./Toast";

export function AISREAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your AI SRE Assistant. I am watching 4.2M telemetry metrics across your infrastructure. Ask me anything or select an option below!" }
  ]);
  const [input, setInput] = useState("");
  const toast = useToast();

  const handleSend = (userText) => {
    const q = userText || input;
    if (!q.trim()) return;

    const newMsgs = [...messages, { role: "user", text: q }];
    setMessages(newMsgs);
    setInput("");

    setTimeout(() => {
      setMessages([
        ...newMsgs,
        {
          role: "assistant",
          text: "I analyzed 4.2 million metrics across your system.\n\nRoot cause: Database connection pool exhaustion due to missing index on table orders(user_id).\n\nWould you like me to:\n1. Increase DB Connection Pool (100 -> 250)\n2. Apply Index Optimization Script\n3. Rollback Deployment v2.1.5",
          options: [
            "Increase DB Pool to 250",
            "Apply Index Optimization Script",
            "Rollback Deployment v2.1.5"
          ]
        }
      ]);
    }, 1000);
  };

  const handleExecuteOption = (opt) => {
    toast.success(`AI SRE Assistant executed: ${opt}`);
    setMessages(prev => [
      ...prev,
      { role: "assistant", text: `✓ Successfully executed: ${opt}! Baseline response latency restored.` }
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-900/90 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-105"
      >
        <span>🤖</span> Ask AI SRE
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl border border-purple-400/30 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-400/20 text-purple-300">🤖</span>
                <span className="text-sm font-bold text-white">AI SRE Operations Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            {/* Chat Messages */}
            <div className="h-72 overflow-y-auto space-y-3 p-1 text-xs">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-xl p-3 max-w-[85%] whitespace-pre-line ${
                    m.role === "user" ? "bg-purple-600 text-white" : "bg-white/10 text-white/90"
                  }`}>
                    {m.text}
                  </div>

                  {m.options && (
                    <div className="mt-2 space-y-1.5 w-full">
                      {m.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExecuteOption(opt)}
                          className="w-full rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-2 text-left text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
                        >
                          ⚡ {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI SRE: Why is app slow?"
                className="flex-1 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button type="submit" className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white">
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
