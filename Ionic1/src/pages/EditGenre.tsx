import React, {useContext, useEffect, useState} from 'react';

import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonDatetime,
    IonHeader,
    IonInput,
    IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';
import {dateToString, IonDateTimeDateFormat, GenreContext, GenreProps, stringToDate} from "./MusicCommon";

interface EditGenreProps extends RouteComponentProps<{
    id?: string;
}> {
}

const EditGenre: React.FC<EditGenreProps> = ({history, match}) => {
    const {genres, saving, savingError, saveGenre} = useContext(GenreContext);
    const [name, setName] = useState<string>('');
    const [dateAdded, setDateAdded] = useState<Date>(new Date());
    const [genre, setGenre] = useState<GenreProps>();
    useEffect(() => {
        const routeId = match.params.id || '';
        const genre = genres?.find(it => it.id === routeId);
        setGenre(genre);
        if (genre && !name) {
            setName(genre.name);
            setDateAdded(genre.dateAdded);
        }
    }, [match.params.id, genre, name]);
    const handleSave = () => {
        const editedGenre = genre ? {
            ...genre,
            name: name,
            dateAdded: dateAdded,
        } : {name: name, dateAdded: dateAdded};
        saveGenre && saveGenre(editedGenre).then(() => history.goBack());
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Genre</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')}/>
                <IonDatetime displayFormat={IonDateTimeDateFormat} value={dateToString(dateAdded)}
                             onIonChange={e => setDateAdded(stringToDate(e.detail.value))}/>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save genre'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default EditGenre;