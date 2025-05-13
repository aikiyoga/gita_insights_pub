'use client'

import {explainVerse, explainVerse_without_Translation} from '@/ai/flows/generate-verse-explanation';
import {getRandomVerse, getFirstVerse, Verse} from '@/services/bhagavad-gita';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useEffect, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getAllVerses, getChapterTitles, Chapter} from "@/services/bhagavad-gita";
import {footer_Message, footer_Message_jp} from "@/services/bhagavad-gita";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import { chapters } from '@/services/gita_chapter_titles';
import { set } from 'date-fns';
import { on } from 'events';

let chapternum = 1;
let versenum = 1;

function setChapterNum(chapter: number) {
  chapternum = chapter;
}
function setVerseNum(verse: number) {
  versenum = verse;
}

let listView = true;
function setListView(view: boolean) {
  listView = view;
}

async function getExplanation(verse: Verse, language: string) {
  setChapterNum(verse.chapter);
  setVerseNum(verse.verse);
  const explanationResult = await explainVerse({verse, language});
  return {
    verse, 
    explanation: explanationResult.explanation, 
    directTranslation: explanationResult.directTranslation,
    wordtowordTranslation: explanationResult.wordtowordTranslation
  };
}

async function getNewRandomVerse(language: string): Promise<{ verse: Verse; explanation: string; directTranslation: string; wordtowordTranslation: string }> {
  const verse = await getRandomVerse();
  return getExplanation(verse, language);
}

async function getInitialVerse(language: string): Promise<{ verse: Verse; explanation: string; directTranslation: string; wordtowordTranslation: string }> {
  const verse = await getFirstVerse();
  return getExplanation(verse, language);
}

async function getTranslatedVerse(verse: Verse, language: string): Promise<{ explanation: string; directTranslation: string; wordtowordTranslation: string }> {
  return getExplanation(verse, language);
}

function replaceSemicolonSpaceWithNewline(text: string): string {
  return text.replace(/; /g, '\n').replace(/—/g, ' — ');
}

async function getExplanation_without_Translation(verse: Verse, language: string) {
  setChapterNum(verse.chapter);
  setVerseNum(verse.verse);
  const explanationResult = await explainVerse_without_Translation({verse, language});
  return {
    verse, 
    explanation: explanationResult.explanation, 
    wordtowordTranslation: explanationResult.wordtowordTranslation
  };
}

async function getNewRandomVerse_without_Translation(language: string): Promise<{ verse: Verse; explanation: string; wordtowordTranslation: string }> {
  const verse = await getRandomVerse();
  return getExplanation_without_Translation(verse, language);
}

async function getInitialVerse_without_Translation(language: string): Promise<{ verse: Verse; explanation: string; wordtowordTranslation: string }> {
  const verse = await getFirstVerse();
  return listView? {verse: verse, explanation: '', wordtowordTranslation: ''} 
          : getExplanation_without_Translation(verse, language);
}

async function getTranslatedVerse_without_Translation(verse: Verse, language: string): Promise<{ explanation: string; wordtowordTranslation: string }> {
  return listView? {explanation: '', wordtowordTranslation: ''}
          : getExplanation_without_Translation(verse, language);
}

export default function Home() {
  const [verseData, setVerseData] = useState<{ verse: Verse; explanation: string; /*directTranslation: string;*/ wordtowordTranslation: string } | null>(null);
  const [translatedVerse, setTranslatedVerse] = useState<{ explanation: string; /*directTranslation: string;*/ wordtowordTranslation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('US English'); // Default language
  const [allVerses, setAllVerses] = useState<Verse[]>([]);
  const [chapterTitles, setChapterTitles] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(chapternum);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(versenum);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [open, setOpen] = useState(false);
  const [verseOpen, setVerseOpen] = useState(false);

  const updateChapterVerse = async  () => {
    setSelectedChapter(chapternum);
    setSelectedVerse(versenum);
  };

  const setMyChapter = (chapter: number) => {
    setChapterNum(chapter);
    setSelectedChapter(chapter);
  };

  const setMyVerse = (verse: number) => {
    setVerseNum(verse);
    setSelectedVerse(verse);
  };

  useEffect(() => {
    async function loadInitialData() {
      const verses = await getAllVerses();
      setAllVerses(verses);

      const titles = await getChapterTitles();
      setChapterTitles(titles);

      const initialData = await getInitialVerse_without_Translation(language);
      setVerseData(initialData);

      const translated = await getTranslatedVerse_without_Translation(initialData.verse, language);
      setTranslatedVerse(translated);

        // Initialize selected chapter and verse
      setMyChapter(initialData.verse.chapter);
      setMyVerse(initialData.verse.verse);

      setIsLoading(false);
    }

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      if (allVerses.length > 0 && selectedChapter) {
          const filteredVerses = allVerses.filter(verse => verse.chapter === selectedChapter);
          setChapterVerses(filteredVerses);
          if (selectedVerse === null && filteredVerses.length > 0) {
              setMyVerse(1);
          }
      }
  }, [allVerses, selectedChapter, selectedVerse]);

  useEffect(() => {
    if (verseData) {
      setMyChapter(verseData.verse.chapter);
      setMyVerse(verseData.verse.verse);
      updateChapterVerse();
    }
  }, [verseData]);

  const handleNewInsight = async () => {
    setIsLoading(true);
    const newVerseData = await getNewRandomVerse_without_Translation(language);
    setVerseData(newVerseData);

    const translated = await getTranslatedVerse_without_Translation(newVerseData.verse, language);
    setTranslatedVerse(translated);

    setMyChapter(newVerseData.verse.chapter);
    setMyVerse(newVerseData.verse.verse);

    setIsLoading(false);
  };

  const handleLanguageChange = async () => {
    setIsLoading(true);
    // console.log("language", language);

    const mylang = (language === "US English")? "Japanese" : "US English";

    if (verseData) {
      const translated = await getTranslatedVerse_without_Translation(verseData.verse, mylang);
      setTranslatedVerse(translated);
    }
    setIsLoading(false);
  };

  const handlePrevButton = async () => {
    if (listView) {
      handlePrevChapter();
    } else {
      handlePrevVerse();
    }
  };
  const handlePrevChapter = async () => {
    if (chapternum == 0) return;
    handleChapterChange(chapternum - 1);
  };

  const handlePrevVerse = async () => {
    if (!verseData) return;

    const currentIndex = allVerses.findIndex(
      (v) => v.chapter === verseData.verse.chapter && v.verse === verseData.verse.verse
    );

    if (currentIndex > 0) {
      setIsLoading(true);
      const prevVerse = allVerses[currentIndex - 1];

      const translated = await getTranslatedVerse_without_Translation(prevVerse, language);
      setTranslatedVerse(translated);
      setVerseData({ verse: prevVerse, explanation: '', /*directTranslation: '',*/ wordtowordTranslation: '' }); // set explanation later
      setMyChapter(prevVerse.chapter);
      setMyVerse(prevVerse.verse);
      setIsLoading(false);
    }
  };

  const handleNextButton = async () => {
    if (listView) {
      handleNextChapter();
    } else {
      handleNextVerse();
    }
  };
  const handleNextChapter = async () => {
    if (chapternum == 18) return;
    handleChapterChange(chapternum + 1);
  };

  const handleNextVerse = async () => {
    if (!verseData) return;

    const currentIndex = allVerses.findIndex(
      (v) => v.chapter === verseData.verse.chapter && v.verse === verseData.verse.verse
    );

    if (currentIndex < allVerses.length - 1) {
      setIsLoading(true);
      const nextVerse = allVerses[currentIndex + 1];

      const translated = await getTranslatedVerse_without_Translation(nextVerse, language);
      setTranslatedVerse(translated);
      setVerseData({ verse: nextVerse, explanation: '', /*directTranslation: '',*/ wordtowordTranslation: '' }); // set explanation later
      setMyChapter(nextVerse.chapter);
      setMyVerse(nextVerse.verse);
      setIsLoading(false);
    }
  };

    const handleChapterChange = async (chapter: number) => {
        setMyChapter(chapter);
        setMyVerse(1); // Reset verse selection when chapter changes
        versenum = 1;
        setSelectedVerse(1);

        // Find the first verse in the selected chapter
        const firstVerse = allVerses.find(v => v.chapter === chapter);

        if (firstVerse) {
            await handleVerseChange(1); // Set verse to 1 when chapter changes
        }
    };

    const handleVerseChange = async (verseNumber: number) => {
        setMyVerse(verseNumber);

        const selectedVerseData = allVerses.find(
            (v) => v.chapter === chapternum && v.verse === verseNumber
        );
        if (selectedChapter != chapternum) {
          setSelectedChapter(chapternum);
        }

        if (selectedVerseData) {
            setIsLoading(true);
            const translated = await getTranslatedVerse_without_Translation(selectedVerseData, language);
            setTranslatedVerse(translated);
            setVerseData({ verse: selectedVerseData, explanation: '', /*directTranslation: '',*/ wordtowordTranslation: '' }); // set explanation later
            setIsLoading(false);
        }
    };

  const isFirstChapter = verseData?.verse.chapter === 1;
  const isLastChapter = verseData?.verse.chapter === 18;
  const isFirstVerse = verseData?.verse.chapter === 1 && verseData?.verse.verse === 1;
  const isLastVerse = verseData?.verse.chapter === 18 && verseData?.verse.verse === 78;

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const clickHereToCommentary = () => {
    return (language == "US English")? "- Click here to view the commentary of this verse -" : "- クリックしてこの詩の解説を表示 -";
  };

  // Chapter {verseData.verse.chapter},
  const chapterTitlebyLanguagebyNumber = () => {
    const chapter = chapters[chapternum-1];
    return chapterTitlebyLanguage(chapter);
  };

  const chapterTitlebyLanguage = (chapter: Chapter) => {
    return (language === "US English") ? 
    "Chapter"+chapter.chapter+": "+chapter.title 
    : "第"+chapter.chapter+"章: "+chapter.japaneseTitle;
  };

  // Verse {verseData.verse.verse}
  const verseTitlebyLanguage = (verseNumber?: number) => {
    const vN = (verseNumber) ? verseNumber: versenum;
    return (language === "US English") ? 
    "Verse "+vN 
    : vN+"節";
  };

  const verseTranslationbyLanguage = (verse: Verse) => {
    return (language === "US English") ? verse.translation : verse.translation_jp;
  };

  const verses_of_chapter = () => {
    return allVerses.filter(verse => verse.chapter === chapternum);
  };

  async function onClickVerse(verse: Verse) {
    //console.log("Selected verse:", verse);
    setMyChapter(verse.chapter);
    setMyVerse(verse.verse);

    if (verse) {
      setListView(false);
      setIsLoading(true);
      const translated = await getTranslatedVerse_without_Translation(verse, language);
      setTranslatedVerse(translated);
      setVerseData({ verse: verse, explanation: translated.explanation, /*directTranslation: '',*/ wordtowordTranslation: translated.wordtowordTranslation }); // set explanation later
      setIsLoading(false);
    }
  };

  const handleListView = async () => {
    if (!listView) {
      //setIsLoading(true);
      //setMyChapter(chapternum);
      //setMyVerse(1);
      setListView(true);
      handleChapterChange(chapternum);
      //setIsLoading(false);
    } else {
      const selectedVerseData = allVerses.find(
        (v) => v.chapter === chapternum && v.verse === 1
      );
      if (selectedVerseData) {
        onClickVerse(selectedVerseData);
      }
    }
  };

  const selectChapterbyLanguage = () => {
    return (language === "US English") ? "Select a Chapter" : "章を選択してください";
  };
  const selectVersebyLanguage = () => {
    return (language === "US English") ? "Select a Verse" : "節を選択してください";
  };
  const cancelLabelbyLanguage = () => {
    return (language === "US English") ? "Cancel" : "中止";
  };
  const loadingbyLanguage = () => {
    return (language === "US English") ? "Loading..." : "読み込み中...";
  };
  const usEnglishbyLanguage = () => {
    return (language === "US English") ? "US English" : "英語";
  };
  const japanesebyLanguage = () => {
    return (language === "US English") ? "Japanese" : "日本語";
  };
  const prevButtonbyLanguage = () => {
    return (language === "US English") ? (listView? "Prev Chapter" : "Prev Verse") 
          : (listView? "前の章へ" : "前の節へ");
  };
  const nextButtonbyLanguage = () => {
    return (language === "US English") ? (listView? "Next Chapter" : "Next Verse") 
          : (listView? "次の章へ" : "次の節へ");
  };
  const listViewButtonbyLanguage = () => {
    return (language === "US English") ? (listView? "Verse View" : "List View") 
          : (listView? "節を表示" : "章を表示");
  };
  const footerMessagebyLanguage = () => {
    return (language === "US English") ? footer_Message : footer_Message_jp;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold mt-4 mb-2">
          Gita Insights
        </h1>

        <Select onValueChange={(value) => {
          setLanguage(value);
          handleLanguageChange();
        }} defaultValue={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US English">{usEnglishbyLanguage()}</SelectItem>
            <SelectItem value="Japanese">{japanesebyLanguage()}</SelectItem>
          </SelectContent>
        </Select>

        {isLoading ? (
          <p className="mt-4 mb-4">{loadingbyLanguage()}</p>
        ) : listView ? (
          <Card className="w-full max-w-4xl mt-2">
          <CardHeader>
            <CardTitle>
              <div className="cursor-pointer">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span>
                    {chapterTitlebyLanguagebyNumber()}
                    </span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>{selectChapterbyLanguage()}</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Choose a chapter to start reading from the first verse.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <ScrollArea className="max-h-80">
                              {chapterTitles.map((chapter) => (
                                  <div key={chapter.chapter} className="py-1">
                                      <AlertDialogAction onClick={() => {
                                          handleChapterChange(chapter.chapter);
                                          setOpen(false); // Close the dialog after selection
                                      }}>
                                          {chapterTitlebyLanguage(chapter)}
                                      </AlertDialogAction>
                                  </div>
                              ))}
                              <ScrollBar />
                          </ScrollArea>
                          <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>  
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            {
              verses_of_chapter().map((verse) => (
                <div className="py-2 cursor-pointer" key={verse.verse} onClick={onClickVerse.bind(null, verse)}>
                  <div className="text-xl font-semibold" style={{ color: 'teal' }}>{verse.chapter + "." + verse.verse}</div>
                  <div>{verseTranslationbyLanguage(verse)}</div>
                </div>
            ))}
          </CardContent>
        </Card>

        )
          : (
          verseData ? (
          <Card className="w-full max-w-4xl mt-8">
            <CardHeader>
              <CardTitle>
                <div className="cursor-pointer">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <span>
                 {chapterTitlebyLanguagebyNumber()},
                 </span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>{selectChapterbyLanguage()}</AlertDialogTitle>
                          <AlertDialogDescription>
                              Choose a chapter to start reading from the first verse.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <ScrollArea className="max-h-80">
                          {chapterTitles.map((chapter) => (
                              <div key={chapter.chapter} className="py-1">
                                  <AlertDialogAction onClick={() => {
                                      handleChapterChange(chapter.chapter);
                                      setOpen(false); // Close the dialog after selection
                                  }}>
                                      {chapterTitlebyLanguage(chapter)}
                                  </AlertDialogAction>
                              </div>
                          ))}
                          <ScrollBar />
                      </ScrollArea>
                      <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                      </AlertDialogFooter>
                  </AlertDialogContent>
            </AlertDialog>  
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <span>
                    &nbsp;{verseTitlebyLanguage()}
                 </span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{selectVersebyLanguage()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Choose a verse to start reading from the selected chapter.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="max-h-80">
                  {chapterVerses.map((verse) => (
                    <div key={verse.verse} className="py-1">
                      <AlertDialogAction onClick={() => {
                        handleVerseChange(verse.verse);
                        setVerseOpen(false); // Close the dialog after selection
                      }}>
                        {verseTitlebyLanguage(verse.verse)}
                      </AlertDialogAction>
                    </div>
                  ))}
                  <ScrollBar />
                </ScrollArea>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setVerseOpen(false)}>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
            </CardTitle>
              <CardDescription className="text-base">{verseData.verse.text}</CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              {translatedVerse && (
                <div className="mb-4">
                  <p className="font-semibold">{verseTranslationbyLanguage(verseData.verse)}</p>
                  <div onClick={toggleVisibility} style={{ height: '10px' }}></div> {/* Add a 10px space */}
                  <p onClick={toggleVisibility} style={{ color: 'lightgray'}} className={`cursor-pointer ${isVisible? 'hidden' : 'block'}`}>{clickHereToCommentary()}</p>
                  <p onClick={toggleVisibility} className={`${isVisible? 'block' : 'hidden'}`}>{translatedVerse.explanation}</p>
                  <div onClick={toggleVisibility} style={{ height: '10px' }}></div> {/* Add a 10px space */}
                  <p className='text-sm py-1 px-3' style={{ color: 'blue', whiteSpace: 'pre-wrap' }}>{replaceSemicolonSpaceWithNewline( translatedVerse.wordtowordTranslation )}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <p>Failed to load verse data.</p>
        ))}

        <div className="flex mt-4">
          <Button
            className="bg-accent text-accent-foreground rounded-md px-4 py-2 mr-2"
            onClick={handlePrevButton}
            disabled={isLoading || (!listView && isFirstVerse) || (listView && isFirstChapter)}
          >
            {prevButtonbyLanguage()}
          </Button>
          <Button
            className="bg-accent text-accent-foreground rounded-md px-4 py-2 mr-2"
            onClick={handleListView}
            disabled={isLoading}
          >
            {listViewButtonbyLanguage()}
          </Button>
          <Button
            className="bg-accent text-accent-foreground rounded-md px-4 py-2"
            onClick={handleNextButton}
            disabled={isLoading || (!listView && isLastVerse) || (listView && isLastChapter)}
          >
            {nextButtonbyLanguage()}
          </Button>
        </div>
        <div className="mt-4">
          {footerMessagebyLanguage()}
        </div>
      </main>
    </div>
  );
}
