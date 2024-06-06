import { useEffect, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

var searchNotesQuery = "";
function HomeScreen({ navigation }) {
  const { data: searchData, error, isLoading } = useSearchNotesQuery(searchNotesQuery);
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ deleteNote ] = useDeleteNoteMutation();
  const [searchValue, setSearchValue] = useState(""); 
  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("Edit", {data: addNoteData});
    }
  }, [addNoteData]);

  const renderItem = ({ item }) => (
    // When you click on a note, it will take you to the edit screen with the note's data
    <TouchableOpacity onPress={() => navigation.navigate("Edit", {data: {id: item.id, title: item.title, content: item.content}}) } style={tw`w-[98%] mb-0.5 mx-auto bg-gray-800 rounded-sm px-1`}> 
      <Text style={tw`text-white text-2xl m-3`}>{item.title}</Text>
      <Text style={tw`text-white m-3 mb-5`}>{item.content}</Text>
    </TouchableOpacity>
  )

  // Update the search query when the user types in the search bar in real time
  const setSearchValueHelper = (text) => {
    setSearchValue(text);
    searchNotesQuery = text;
  }

  // Return search bar, notes, and add note button
  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900`}>
        <TextInput style={tw`text-white p-1 mt-5 w-90%`}
          value={searchValue}
          onChangeText={setSearchValueHelper}
          autoFocus={false}
          placeholder='search...'
        />
      {searchData ? 
        <MasonryList
          style={tw`m-5 pb-20`}
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "", content: ""}); }} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditScreen({ route, navigation }) {
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ updateNote, { data: updateNoteData, error: updateNoteError }] = useUpdateNoteMutation();
  const [ deleteNote ] = useDeleteNoteMutation();
  const [titleTextValue, setTitleTextValue] = useState(route.params.data.title); 
  const [contentTextValue, setContentTextValue] = useState(route.params.data.content); 

  // Update the title and content when the user types in the text input in real time
  const setTitleTextValueHelper = (text) => {
    setTitleTextValue(text);
    handleEditing(text, contentTextValue);
  }

  const setContentTextValueHelper = (text) => {
    setContentTextValue(text);
    handleEditing(titleTextValue, text);
  }

  // Update the note in the database and display a message saying the note was saved with date/time
  const handleEditing = (title, content) => {
    var pElement = document.getElementById('saved');
    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString()
    pElement.textContent = 'Note Saved - ' + formattedDate + ' ' + formattedTime;
    updateNote({id: route.params.data.id, title: title, content: content});
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.data.title });
  }, []);

  // Delete the note from the database and go back to the home screen
  deleteNoteHelper = () => {
    deleteNote({id: route.params.data.id});
    navigation.navigate("Home");
  }

  // Return the title and content text inputs and a delete button
  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900 text-white`}>
      <TouchableOpacity onPress={() => { deleteNoteHelper() }} style={tw`bg-red-500 rounded-full absolute top-5 right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>x</Text>
      </TouchableOpacity>
      <TextInput style={tw`text-white text-3xl p-1 h-10 w-120`}
          value={titleTextValue}
          onChangeText={setTitleTextValueHelper}
          autoFocus={true}
          placeholder='Title'
        />
      <TextInput style={tw`text-white p-1 h-90 w-120`}
          value={contentTextValue}
          onChangeText={setContentTextValueHelper}
          autoFocus={false}
          placeholder='Content'
          multiline // For multiline input
        />
        <p id="saved"> </p>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Edit"
            component={EditScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}