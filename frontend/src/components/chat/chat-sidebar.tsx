// "use client";

// import { useState, useEffect } from "react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
//   SidebarFooter,
// } from "@/components/ui/sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Plus,
//   Search,
//   MessageSquare,
//   Settings,
//   User,
//   LogOut,
// } from "lucide-react";
// import { Logo } from "./logo";
// import { chatService } from "@/services/chat";
// import { authService } from "@/services/auth";

// interface ChatHistory {
//   sessionId: string;
//   createdAt: string;
//   lastActivity: string;
//   totalMessages: number;
// }

// export function ChatSidebar() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadChatHistory();
//   }, []);

//   const loadChatHistory = async () => {
//     try {
//       const response = await chatService.getUserSessions();
//       setChatHistory(response.data.sessions);
//     } catch (error) {
//       console.error("Failed to load chat history:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await authService.logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now.getTime() - date.getTime();
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//     if (days === 0) {
//       return date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } else if (days === 1) {
//       return "Yesterday";
//     } else if (days < 7) {
//       return `${days} days ago`;
//     } else {
//       return date.toLocaleDateString();
//     }
//   };

//   const filteredHistory = chatHistory.filter((chat) =>
//     chat.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Sidebar className="w-80 border-r">
//       <SidebarHeader className="p-4">
//         <div className="flex items-center gap-3 mb-4">
//           <Logo className="w-8 h-8" />
//           <span className="text-xl font-semibold">Nexly</span>
//         </div>

//         <Button className="w-full justify-start gap-2" variant="default">
//           <Plus className="w-4 h-4" />
//           New Chat
//         </Button>
//       </SidebarHeader>

//       <SidebarContent className="px-4">
//         <SidebarGroup>
//           <SidebarGroupLabel>Search Chat History</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <div className="relative">
//               <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search conversations..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         <SidebarGroup>
//           <SidebarGroupLabel>Chat History</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <ScrollArea className="h-[400px]">
//               {isLoading ? (
//                 <div className="p-4 text-center text-muted-foreground">
//                   Loading chat history...
//                 </div>
//               ) : filteredHistory.length === 0 ? (
//                 <div className="p-4 text-center text-muted-foreground">
//                   {searchQuery
//                     ? "No matching conversations"
//                     : "No chat history yet"}
//                 </div>
//               ) : (
//                 <SidebarMenu>
//                   {filteredHistory.map((chat) => (
//                     <SidebarMenuItem key={chat.sessionId}>
//                       <SidebarMenuButton
//                         asChild
//                         className="h-auto p-3 hover:bg-accent"
//                       >
//                         <div className="flex flex-col items-start gap-1 w-full">
//                           <div className="flex items-center gap-2 w-full">
//                             <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
//                             <span className="font-medium text-sm truncate">
//                               {chat.sessionId}
//                             </span>
//                           </div>
//                           <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
//                             {chat.totalMessages} messages
//                           </p>
//                           <span className="text-xs text-muted-foreground ml-6">
//                             {formatDate(chat.lastActivity)}
//                           </span>
//                         </div>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               )}
//             </ScrollArea>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="p-4">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild>
//               <Button variant="ghost" className="w-full justify-start gap-2">
//                 <User className="w-4 h-4" />
//                 Profile
//               </Button>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild>
//               <Button variant="ghost" className="w-full justify-start gap-2">
//                 <Settings className="w-4 h-4" />
//                 Settings
//               </Button>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild>
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start gap-2"
//                 onClick={handleLogout}
//               >
//                 <LogOut className="w-4 h-4" />
//                 Logout
//               </Button>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
