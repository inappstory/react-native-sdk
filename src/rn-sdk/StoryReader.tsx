import React from "react";
import {StoryReaderProps} from "./StoryReader.h";
import {StoryReaderComponent} from "./StoryReaderComponent";
import {StoryFavoriteReaderComponent} from "./StoryFavoriteReaderComponent";

function StoryReader({storyManager}: StoryReaderProps) {

    return (
        <>
            <StoryFavoriteReaderComponent storyManager={storyManager}/>
            <StoryReaderComponent storyManager={storyManager}/>
        </>
    );

}

export {StoryReader};
