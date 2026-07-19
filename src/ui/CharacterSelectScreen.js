//画面表示とクリックを受け付け、結果をgame.jsに返す

export class CharacterSelectScreen {
    constructor(screenElement) {
        this.screenElement = screenElement;
        this.selectedCharacter = null;
    }

    showPlayerSelection(characters, onConfirm) {
        this.render({
            title: "キャラクターを選んでください",
            characters,
            onConfirm,
        });
    }

    showEnemySelection(characters, player, onConfirm) {
        const enemyCandidates = characters.filter(
            (character) => character.id !== player.id
        );

        this.render({
            title: "戦う敵を選んでください",
            characters: enemyCandidates,
            onConfirm,
        });
    }

    render({ title, characters, onConfirm }) {
        this.selectedCharacter = null;
        this.screenElement.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = title;

        const characterList = document.createElement("div");
        characterList.classList.add("character-list");

        const confirmButton = document.createElement("button");
        confirmButton.textContent = "決定";
        confirmButton.disabled = true;

        characters.forEach((character) => {
            const card = this.createCharacterCard(character);

            card.addEventListener("click", () => {
                this.selectedCharacter = character;

                characterList
                    .querySelectorAll(".character-card")
                    .forEach((element) => {
                        element.classList.remove("is-selected");
                    });

                card.classList.add("is-selected");
                confirmButton.disabled = false;
            });

            characterList.append(card);
        });

        confirmButton.addEventListener("click", () => {
            if (this.selectedCharacter === null) {
                return;
            }

            onConfirm(this.selectedCharacter);
        });

        this.screenElement.append(
            heading,
            characterList,
            confirmButton
        );
    }

    createCharacterCard(character) {
        const card = document.createElement("button");
        card.type = "button";
        card.classList.add("character-card");

        card.innerHTML = `
            <strong>${character.name}</strong>
            <span>HP：${character.maxHp}</span>
            <span>MP：${character.maxMp}</span>
            <span>ATK：${character.atk}</span>
            <span>DEF：${character.def}</span>
        `;

        return card;
    }
}