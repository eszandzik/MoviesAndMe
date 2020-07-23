import React from 'react'
import {StyleSheet, View, Button, TextInput, Text, FlatList, ActivityIndicator} from 'react-native'
import FilmItem from "./FilmItem"
import {getFilmFromApiWithSearchedText} from '../API/TMDBApi'
import connect from "react-redux/lib/connect/connect";


class Search extends React.Component {

    constructor(props) {
        super(props)
        this.searchedText = ""   // Initialisation de notre donnée searchedtext en dehors du state
        this.page = 0 // Compteur pour connaitre la page courante
        this.totalPages = 0  // Nbr de pages totales pour savoir si on a atteint la fin des retours de l'api TMDB
        this.state = {
            films: [],
            isLoading: false  // par defaut à false car il n'y a pas de chargement tantqu'on ne lance pas de recherche
        }
    }

    _loadFilms() {
        if (this.searchedText.length > 0) {  // seulement si le texte recherché n'est pas vide
            this.setState({isLoading: true})
            getFilmFromApiWithSearchedText(this.searchedText, this.page + 1).then(data => {
                this.page = data.page
                this.totalPages = data.total_pages
                this.setState({
                    films: [...this.state.films, ...data.results],
                    isLoading: false
                })
            })
        }
    }

    _searchedTextInputChanged(text) {
        this.searchedText = text    // Modification du text recherché à chaque saisie de text, sans passer par le setstate
    }

    _displayLoading() {
        if (this.state.isLoading) {
            return (
                <View style={styles.loading_container}>
                    <ActivityIndicator size='large'/>
                </View>
            )
        }
    }

    _searchFilms() {  // Remettre à zéro les films de notre state
        this.page = 0
        this.totalPages = 0
        this.setState({
            films: [],
        }, () => {
            // J'utilise le parametre length sur mon tableau de films pour vérifier qu'il y a bien 0 film
            console.log("page : " + this.page + "/ TotalPages : " + this.totalPages + " / Nombre de films : " + this.state.films.length)
            this._loadFilms()
        })
    }

    _displayDetailForFilm = (idFilm) => {
        console.log("Display film with id " + idFilm)
        this.props.navigation.navigate("FilmDetail", {idFilm: idFilm})
    }

    render() {
        console.log(this.props)
        return (
            <View style={styles.main_container}>
                <TextInput style={styles.textinput}
                           placeholder="Titre du film"
                           onChangeText={(text) => this._searchedTextInputChanged(text)}
                           onSubmitediting={() => this._searchFilms()}
                />
                <Button title="rechercher" onPress={() => this._searchFilms()}/>
                <FlatList
                    data={this.state.films}
                    extraData={this.props.favoritesFilm} // On utilise la props extraData pour indiquer à notre FlateList que d'autres données doivent etre prises en compte si on lui demande de se re-rendre
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => <FilmItem film={item}
                                                      // Ajout d'une props isFilmFavorite pour indiquer à l'item d'afficher un coeur plein ou non
                                                      isFilmFavorite={(this.props.favoritesFilm.findIndex(film => film.id === item.id) !== -1) ? true : false}
                                                      displayDetailForFilm={this._displayDetailForFilm}/>}
                    onEndReachedThreshold={0.5}
                    onEndReached={() => {
                        if (this.page < this.totalPages) { // On vérifie qu'on n'a pas atteint la fin de la pagination (totalpages) avant de charger d'éléments
                            this._loadFilms()
                        }
                    }}
                />
                {this._displayLoading()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    main_container: {
        flex: 1
    },
    textinput: {
        marginLeft: 5,
        marginRight: 5,
        height: 50,
        borderColor: '#000000',
        borderWidth: 1,
        paddingLeft: 5
    },
    loading_container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 100,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
// On connect le store Redux ainsi que les films favoris du state de notre application, à notre component Search
const mapStateToProps = state => {
    return {
        favoritesFilm: state.favoritesFilm
    }
}

export default connect(mapStateToProps) (Search)
