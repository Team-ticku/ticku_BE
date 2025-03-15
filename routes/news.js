// /routes/news.js
const express = require("express");
const fetch = require("node-fetch");
const xml2js = require("xml2js");
const cheerio = require("cheerio");

const router = express.Router();
const parser = new xml2js.Parser({ explicitArray: false });

router.get("/:corp_code", async (req, res) => {
  try {
    const corpCode = req.params.corp_code;
    if (!corpCode) {
      return res.status(400).json({ message: "회사 코드를 입력해주세요." });
    }

    const corpName = req.query.corp_name;
    if (!corpName) {
      return res.status(400).json({ message: "회사 이름을 입력해주세요." });
    }

    const encodedCorpName = encodeURIComponent(corpName);
    const RSS_URL = `https://news.google.com/rss/search?q=${encodedCorpName}+when:1d&hl=ko&gl=KR&ceid=KR:ko`;

    const response = await fetch(RSS_URL);
    if (!response.ok) {
      console.error(`Fetch error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        message: `뉴스 가져오기 실패: ${response.status} ${response.statusText}`,
      });
    }
    const xmlData = await response.text();
    const result = await parser.parseStringPromise(xmlData);

    if (
      !result ||
      !result.rss ||
      !result.rss.channel ||
      !result.rss.channel.item
    ) {
      console.error("Invalid XML structure:", result);
      return res.status(500).json({ message: "잘못된 XML 응답 형식입니다." });
    }

    const items = result.rss.channel.item;

    // 10개만 보내기
    const slicedItems = items.slice(0, 10);

    const newsData = await Promise.all(
      slicedItems.map(async (item) => {
        let content = item.description || "";
        let sourceName = "";
        let imageUrl = "";
        let sourceImageUrl = "";

        const $ = cheerio.load(content);
        sourceName = $("font[color='#6f6f6f']").text();
        let plainContent = $.text().replace(sourceName, "").trim();

        try {
          const articleResponse = await fetch(item.link, { timeout: 5000 }); // 타임아웃 5초
          if (articleResponse.ok) {
            const articleHtml = await articleResponse.text();
            const article$ = cheerio.load(articleHtml);

            imageUrl =
              article$('meta[property="og:image"]').attr("content") ||
              article$('img[itemprop="image"]').attr("src") ||
              article$(".article-body img").first().attr("src") ||
              article$("#content img").first().attr("src") ||
              article$("img").first().attr("src");

            sourceImageUrl =
              article$('meta[property="og:logo"]').attr("content") || // Open Graph
              article$(".logo img").first().attr("src"); // 일반적인 로고 위치

            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = "https:" + imageUrl; // 또는 웹사이트 기본 URL 사용
            }

            if (sourceImageUrl && !sourceImageUrl.startsWith("http")) {
              sourceImageUrl = "https:" + sourceImageUrl;
            }
          } else {
            console.error(
              `Article fetch error: ${articleResponse.status} ${articleResponse.statusText}`
            );
          }
        } catch (error) {
          console.error("Error fetching or parsing article:", error); // 더 자세한 에러 메시지
        }

        return {
          title: item.title || "",
          content: plainContent,
          link: item.link || "#",
          pubDate: item.pubDate || "",
          hasImage: !!imageUrl,
          image: imageUrl,
          sourceName: sourceName,
          sourceImage: sourceImageUrl,
          defaultBookmarked: false,
        };
      })
    );

    res.json(newsData);
  } catch (error) {
    console.error("Error in /news route:", error);
    res.status(500).json({ message: "에러 발생: " + error.message });
  }
});

module.exports = router;
