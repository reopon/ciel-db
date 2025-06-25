export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-sm leading-relaxed">
      <h1 className="text-xl font-bold mb-4">about</h1>

      <p className="mb-4">
        このサイトは、Gran☆Cielの情報、主にライブのセットリストと楽曲情報を記録・整理することを目的とした、非公式・非公認のファンサイトです。<br />
        過去のデータについては追える範囲で追加していく予定です。
      </p>

      <h2 className="font-semibold mt-6 mb-2">情報の出典について</h2>
      <p className="mb-4">
        Gran☆Ciel公式やメンバー、関係者のSNSを参照しています。<br />
        また、wikipediaやファンの方が発信した情報も参考にしています。
      </p>

      <h2 className="font-semibold mt-6 mb-2">お問い合わせ・修正依頼など</h2>
      <p className="mb-4">
        <a href="https://twitter.com/reopon" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">@reopon</a> までご連絡いただければ幸いです。<br />
      </p>

      <p>
        since 2025.06.25
      </p>

    </div>
  );
}
