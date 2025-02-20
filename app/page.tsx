import Image from "next/image";
import styles from "./page.module.css";

// For Components
import { ChatRoom } from "@/app/Components/ChatRoom/ChatRoom";

export default function Home() {
  return (
    <ChatRoom/>
  );
}
