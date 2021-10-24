import React, {useContext} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {GenreContext} from "./MusicCommon";
import Genre from "./Genre";

const GenreList: React.FC<RouteComponentProps> = ({history}) => {
    const {genres, fetching, fetchingError} = useContext(GenreContext);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Music Tracker</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {genres && (
                    <IonList>
                        {genres.map(({id, name,dateAdded}) =>
                            <Genre key={id} id={id} name={name} dateAdded={dateAdded} onEdit={id => history.push(`/genre/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/genre')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default GenreList;