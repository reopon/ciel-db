export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-sm leading-relaxed">
      <h1 className="text-xl font-bold mb-4">about</h1>

      <p className="mb-4">
        Gran☆Cielのセットリストを記録・整理することを目的とした、非公式・非営利のデータベースサイトです。<br />
        楽曲情報もまとめ始めました。<br />
        所属事務所やメンバーご本人、関係各所とは一切関係ございません。<br />
      </p>

      <h2 className="font-semibold mt-6 mb-2">情報の出典について</h2>
      <p className="mb-4">
        Gran☆Ciel公式やメンバー、関係者のSNSなどweb公開情報を参照しています。<br />
        また、wikipediaやファンの方が発信した情報も参考にしています。
      </p>

      <h2 className="font-semibold mt-6 mb-2">セットリストの登録状況</h2>
      <p className="mb-4">
        2025年6月1日以降のライブイベントのセットリストは、情報を確認できましたら数日以内に登録しています。<br />
        過去のデータについては随時、追える範囲で追加していく予定です。
      </p>

      <h2 className="font-semibold mt-6 mb-2">お問い合わせ</h2>
      <p className="mb-4">
        <a href="https://x.com/reopon" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">@reopon</a> までご連絡いただければ幸いです。<br />
      </p>

    </div>
  );
}
