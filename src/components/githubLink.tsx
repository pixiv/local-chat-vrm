export const GitHubLink = () => {
  return (
    <div className="absolute right-0 z-10 m-24">
      <a
        draggable={false}
        href="https://github.com/pixiv/local-chat-vrm"
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="p-8 rounded-16 bg-[#1F2328] hover:bg-[#33383E] active:bg-[565A60] flex">
          <img
            alt="https://github.com/pixiv/local-chat-vrm"
            height={24}
            width={24}
            src={"./github-mark-white.svg"}
          ></img>
          <div className="mx-4 text-white font-bold">Fork me</div>
        </div>
      </a>
    </div>
  );
};
