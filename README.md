- Simple and easy
    - View 
    - Text
    - Stylesheet => objects 
        - FlexBox 
            - Flex : 1 => vertically sari available space le le bhai 
            - justifyContent: main axis aliggnment => vertical me bhai
            - alignItem => another axis ek around alignment 
            - flexDirection => by default top to bottom hai
        - Positions
            - margin => sibilings ke bich ka space
            - padding => view ke andar ka space
- SafeAreaView
    - Start rendering inside the safe part of the screen
    - Almost every screen starts with SafeAreaView


- Concpets 
    - TextInput
    - Pressable
        => thinking in terms of press => similer to Onclick , isme alag se lagana padta hai
    - StatusBar => 📶  4G  🔋  87%     => this belongs to Android/IOS not my app
    - Mobile keyboard behavior
    - Controlled components using useState

- UI so far
![App screenshot](./public/1.jpg)



Concepts 
- ScrollView => for scrolling
    - by default => vertial scrolling 
    - horizontal scrolling 
- map() for rendering UI => Why map here ? 
- Reusable CategoryChip component
- First-principles difference:
    ScrollView
        - Small static list
        - loads everything at the same time 
    FlatList
        - Large dynamic lists
        - only create relevent ones , and crrearte on the go when we go in there
        - This process is called Virtualization


Concepts
- Image component
- Local assets (src/assets/images)
- Remote vs Local images
- resizeMode
- Dimensions API
- Responsive UI
- ScrollView with pagingEnabled (our first carousel)


Concepts
- FlatList (deep dive from first principles)
    - FlatList only renders what's visible + a small buffer.
    - Process is called Virtualization
    ```jsx
        <FlatList
            data={restaurants} // => about the data array  => [{}, {}, {}, {}]
            renderItem={...} // => For every restaurant object, create this UI
            keyExtractor={...} // => unique identifier
            showsVerticalScrollIndicator={false} // are vo scrollbar wala hai ye kuch 
        />
    ```
- ImageBackground 
    - why not imaages => becauee badges ye texts image ke upar aayega
    - in here => image becomes the container
- position: "absolute"
- overflow: "hidden"
- Reusable RestaurantCard
- Static restaurant data architecture